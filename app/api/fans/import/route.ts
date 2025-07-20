import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// Define types for CSV records
interface CSVRecord {
  email?: string;
  name?: string;
  first_name?: string;
  [key: string]: string | undefined;
}

interface NormalizedRecord {
  email: string;
  name: string;
  tags: string[];
  custom_fields: Record<string, string>;
}

// Define schema for validating fan data
const FanSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    // Parse the request as FormData (for file upload)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tags = formData.get('tags') as string;
    const source = formData.get('source') as string || 'import';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv') {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }

    // Read the file content
    const fileContent = await file.text();
    console.log('File content:', fileContent.substring(0, 200) + '...');

    // Parse CSV
    let records: CSVRecord[];
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as CSVRecord[];

      console.log(`Successfully parsed ${records.length} records from CSV`);
      console.log('First record sample:', records.length > 0 ? JSON.stringify(records[0]) : 'No records');
    } catch (parseError) {
      console.error('Error parsing CSV:', parseError);
      return NextResponse.json({ error: 'Failed to parse CSV file. Please check the format.' }, { status: 400 });
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'No records found in the file' }, { status: 400 });
    }

    // Process and validate records
    const validRecords: NormalizedRecord[] = [];
    const invalidRecords: (CSVRecord & { error: string })[] = [];
    const existingEmails = new Set();

    // First, get all existing emails to check for duplicates
    const { data: existingFans } = await supabase
      .from('fans')
      .select('email')
      .eq('artist_id', artist.id);

    if (existingFans) {
      existingFans.forEach(fan => existingEmails.add(fan.email.toLowerCase()));
    }

    // Process each record
    for (const record of records) {
      try {
        // Validate required email field
        if (!record.email?.trim()) {
          invalidRecords.push({
            ...record,
            error: 'Email is required',
          });
          continue;
        }

        // Normalize the record
        const normalizedRecord: NormalizedRecord = {
          email: record.email.trim().toLowerCase(),
          name: record.name?.trim() || record.first_name?.trim() || '',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          custom_fields: {},
        };

        // Add any additional fields as custom fields
        Object.keys(record).forEach(key => {
          if (!['email', 'name', 'first_name'].includes(key) && record[key]) {
            normalizedRecord.custom_fields[key] = record[key] || '';
          }
        });

        // Validate the record
        FanSchema.parse(normalizedRecord);

        // Check for duplicate in the file
        if (existingEmails.has(normalizedRecord.email)) {
          invalidRecords.push({
            ...record,
            error: 'Email already exists in your fan list',
          });
          continue;
        }

        // Add to valid records and track to prevent duplicates in the file
        validRecords.push(normalizedRecord);
        existingEmails.add(normalizedRecord.email);
      } catch (error) {
        invalidRecords.push({
          ...record,
          error: error instanceof z.ZodError ? error.issues[0].message : 'Invalid record',
        });
      }
    }

    // Insert valid records into the database
    if (validRecords.length > 0) {
      const fansToInsert = validRecords.map(record => ({
        artist_id: artist.id,
        email: record.email,
        name: record.name || null,
        tags: record.tags || [],
        custom_fields: record.custom_fields || {},
        status: 'subscribed',
        source: source || 'import',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('fans')
        .insert(fansToInsert)
        .select();

      if (error) {
        console.error('Error inserting fans:', error);
        return NextResponse.json({ error: 'Failed to import fans' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      imported: validRecords.length,
      failed: invalidRecords.length,
      errors: invalidRecords,
    });
  } catch (error) {
    console.error('Error importing fans:', error);
    return NextResponse.json({ error: 'Failed to import fans' }, { status: 500 });
  }
}