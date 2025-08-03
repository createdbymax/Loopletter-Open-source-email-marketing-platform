import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId, addFanWithValidation } from '@/lib/db';
import { FanFormData } from '@/lib/types';

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse tags from form data
    const additionalTags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

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

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const cityIndex = headers.findIndex(h => h.includes('city'));
    const countryIndex = headers.findIndex(h => h.includes('country'));
    const tagsIndex = headers.findIndex(h => h.includes('tag'));

    if (emailIndex === -1) {
      return NextResponse.json({ error: 'Email column not found' }, { status: 400 });
    }

    // Parse data rows and attempt to import
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>
    };

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const email = row[emailIndex];
      
      if (!email || !email.includes('@')) {
        results.failed++;
        results.errors.push({
          email: email || `Row ${i + 1}`,
          error: 'Invalid email address'
        });
        continue;
      }

      try {
        // Collect tags from CSV and additional tags
        const csvTags = tagsIndex >= 0 && row[tagsIndex] ? row[tagsIndex].split(',').map(t => t.trim()) : [];
        const allTags = [...additionalTags, ...csvTags].filter(tag => tag);

        const fanData: FanFormData = {
          email: email.toLowerCase(),
          name: nameIndex >= 0 ? row[nameIndex] || undefined : undefined,
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

        await addFanWithValidation(fanData, artist.id);
        results.imported++;
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          email,
          error: errorMessage
        });
      }
    }

    if (results.imported === 0 && results.failed > 0) {
      return NextResponse.json({ 
        success: false,
        imported: results.imported,
        failed: results.failed,
        errors: results.errors,
        message: 'No fans were imported successfully'
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      imported: results.imported,
      failed: results.failed,
      errors: results.errors,
      message: `Successfully imported ${results.imported} fans${results.failed > 0 ? ` (${results.failed} failed)` : ''}`
    });

  } catch (error) {
    console.error('Error importing fans:', error);
    return NextResponse.json(
      { error: 'Failed to import fans' },
      { status: 500 }
    );
  }
}