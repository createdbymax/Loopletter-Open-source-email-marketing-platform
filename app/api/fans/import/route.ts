import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, addFanWithValidation } from '@/lib/db';
import { FanFormData } from '@/lib/types';
import { sendImportCompletionEmail, createImportNotification } from '@/lib/import-notifications';

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Create import job
async function createImportJob(
  artistId: string,
  fileData: any,
  skipDuplicates: boolean = false
): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('import_jobs')
    .insert({
      artist_id: artistId,
      type: 'fan_import',
      status: 'pending',
      skip_duplicates: skipDuplicates,
      file_data: fileData
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// Process import job in background
async function processImportJob(jobId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // Update job status to processing
    await supabase
      .from('import_jobs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    const { csv_content, column_mapping, tags, source } = job.file_data;
    const skipDuplicates = job.skip_duplicates;

    // Simple CSV parser
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    }

    const lines = csv_content.split('\n').filter((line: string) => line.trim());
    const headers = parseCSVLine(lines[0]).map((h: string) => h.trim());
    const headersLower = headers.map((h: string) => h.toLowerCase());
    
    let emailIndex = -1;
    let nameIndex = -1;
    let cityIndex = -1;
    let countryIndex = -1;
    let tagsIndex = -1;

    if (column_mapping) {
      emailIndex = headers.findIndex(h => h === column_mapping.email);
      nameIndex = column_mapping.name ? headers.findIndex(h => h === column_mapping.name) : -1;
    } else {
      emailIndex = headersLower.findIndex(h => h.includes('email'));
      nameIndex = headersLower.findIndex(h => h.includes('name'));
    }
    
    cityIndex = headersLower.findIndex(h => h.includes('city'));
    countryIndex = headersLower.findIndex(h => h.includes('country'));
    tagsIndex = headersLower.findIndex(h => h.includes('tag'));

    const totalRows = lines.length - 1;
    const results = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ email: string; error: string }>
    };

    // Update total records
    await supabase
      .from('import_jobs')
      .update({ 
        total_records: totalRows,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const email = row[emailIndex]?.trim();
      
      // Update progress
      const progress = Math.round((i / totalRows) * 100);
      await supabase
        .from('import_jobs')
        .update({ 
          progress,
          processed_records: i,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // Skip empty rows
      if (!email) {
        continue;
      }
      
      // Validate email format
      if (!isValidEmail(email)) {
        results.failed++;
        results.errors.push({
          email: email || `Row ${i + 1}`,
          error: 'Invalid email format'
        });
        continue;
      }

      try {
        // Collect tags from CSV and additional tags
        const csvTags = tagsIndex >= 0 && row[tagsIndex] ? row[tagsIndex].split(',').map((t: string) => t.trim()) : [];
        const allTags = [...tags, ...csvTags].filter((tag: string) => tag);

        const fanData: FanFormData = {
          email: email.toLowerCase(),
          name: nameIndex >= 0 && row[nameIndex]?.trim() ? row[nameIndex].trim() : undefined,
          tags: allTags.length > 0 ? allTags : undefined,
          source,
          custom_fields: {}
        };

        // Add location data if available
        if (cityIndex >= 0 || countryIndex >= 0) {
          fanData.custom_fields = {
            ...fanData.custom_fields,
            ...(cityIndex >= 0 && row[cityIndex] && { city: row[cityIndex] }),
            ...(countryIndex >= 0 && row[countryIndex] && { country: row[countryIndex] })
          };
        }

        await addFanWithValidation(fanData, job.artist_id);
        results.imported++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a duplicate and we should skip
        if (skipDuplicates && errorMessage.includes('already exists')) {
          results.skipped++;
        } else {
          results.failed++;
          results.errors.push({
            email,
            error: errorMessage
          });
        }
      }
    }

    // Update job completion
    await supabase
      .from('import_jobs')
      .update({
        status: 'completed',
        progress: 100,
        processed_records: totalRows,
        successful_imports: results.imported,
        failed_imports: results.failed,
        result: results,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Get artist details for notifications
    const { data: artist } = await supabase
      .from('artists')
      .select('email, name')
      .eq('id', job.artist_id)
      .single();

    if (artist) {
      // Create the completed job object for notifications
      const completedJob = {
        ...job,
        status: 'completed' as const,
        progress: 100,
        processed_records: totalRows,
        successful_imports: results.imported,
        failed_imports: results.failed,
        result: results,
        completed_at: new Date().toISOString()
      };

      // Send email notification
      await sendImportCompletionEmail(artist.email, artist.name, completedJob);
      
      // Create dashboard notification
      await createImportNotification(job.artist_id, completedJob);
    }

  } catch (error) {
    console.error('Error processing import job:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update job with error
    await supabase
      .from('import_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Get job details for notifications
    const { data: job } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (job) {
      // Get artist details for notifications
      const { data: artist } = await supabase
        .from('artists')
        .select('email, name')
        .eq('id', job.artist_id)
        .single();

      if (artist) {
        const failedJob = {
          ...job,
          status: 'failed' as const,
          error_message: errorMessage
        };

        // Send email notification
        await sendImportCompletionEmail(artist.email, artist.name, failedJob);
        
        // Create dashboard notification
        await createImportNotification(job.artist_id, failedJob);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get artist
    const artist = await getOrCreateArtistByClerkId(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      user.fullName || 'Artist'
    );

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tagsParam = formData.get('tags') as string;
    const source = formData.get('source') as string || 'csv_import';
    const columnMappingParam = formData.get('columnMapping') as string;
    const skipDuplicatesParam = formData.get('skipDuplicates') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse column mapping if provided
    let columnMapping: { email: string; name: string; [key: string]: string } | null = null;
    if (columnMappingParam) {
      try {
        columnMapping = JSON.parse(columnMappingParam);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid column mapping' }, { status: 400 });
      }
    }

    // Parse tags from form data
    const additionalTags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const skipDuplicates = skipDuplicatesParam === 'true';

    // Read and validate CSV structure
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    // Simple CSV parser that handles quoted fields
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    
    // Validate column mapping
    if (columnMapping) {
      const emailIndex = headers.findIndex(h => h === columnMapping.email);
      if (emailIndex === -1) {
        return NextResponse.json({ error: 'Email column not found' }, { status: 400 });
      }
    }

    // Create import job
    const jobId = await createImportJob(artist.id, {
      filename: file.name,
      column_mapping: columnMapping,
      tags: additionalTags,
      source,
      csv_content: text
    }, skipDuplicates);

    // Start background processing
    // In a real app, you'd use a proper job queue like Bull/BullMQ
    // For now, we'll use a simple setTimeout to simulate background processing
    setTimeout(async () => {
      await processImportJob(jobId);
    }, 100);

    return NextResponse.json({ 
      success: true,
      job_id: jobId,
      message: 'Import job created successfully. You will be notified when processing is complete.'
    });

  } catch (error) {
    console.error('Error importing fans:', error);
    return NextResponse.json(
      { error: 'Failed to import fans' },
      { status: 500 }
    );
  }
}