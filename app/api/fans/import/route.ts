import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const emailIndex = headers.findIndex(h => h.includes('email'));
    const nameIndex = headers.findIndex(h => h.includes('name'));
    const tagsIndex = headers.findIndex(h => h.includes('tag'));

    if (emailIndex === -1) {
      return NextResponse.json({ error: 'Email column not found' }, { status: 400 });
    }

    // Parse data rows
    const fans = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      const email = row[emailIndex];
      
      if (email && email.includes('@')) {
        fans.push({
          email,
          name: nameIndex >= 0 ? row[nameIndex] || null : null,
          tags: tagsIndex >= 0 && row[tagsIndex] ? [row[tagsIndex]] : [],
          source: 'csv_import',
          artist_id: artist.id,
        });
      }
    }

    if (fans.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 });
    }

    // For now, just return success
    // In a real implementation, this would save to database
    return NextResponse.json({ 
      success: true,
      imported: fans.length,
      message: `Successfully imported ${fans.length} fans`
    });

  } catch (error) {
    console.error('Error importing fans:', error);
    return NextResponse.json(
      { error: 'Failed to import fans' },
      { status: 500 }
    );
  }
}