import { NextRequest, NextResponse } from 'next/server';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Clean the slug
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
    }

    // Check for reserved slugs
    const reservedSlugs = [
      'api', 'dashboard', 'admin', 'www', 'mail', 'ftp', 'localhost',
      'sign-in', 'signin', 'login', 'signup', 'register', 'auth',
      'help', 'support', 'contact', 'about', 'terms', 'privacy',
      'blog', 'news', 'app', 'mobile', 'web', 'site', 'home',
      'user', 'users', 'account', 'profile', 'settings', 'config'
    ];

    if (reservedSlugs.includes(cleanSlug)) {
      return NextResponse.json({ 
        error: 'This slug is reserved and cannot be used' 
      }, { status: 400 });
    }

    // Check if slug is already taken by another artist
    const { data: existingArtist, error: checkError } = await supabase
      .from('artists')
      .select('id, clerk_user_id')
      .eq('slug', cleanSlug)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing slug:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If slug exists and belongs to a different user, it's not available
    if (existingArtist && existingArtist.clerk_user_id !== userId) {
      return NextResponse.json({ 
        error: 'This slug is already taken by another artist' 
      }, { status: 400 });
    }

    // Update the artist's slug
    const { data: updatedArtist, error: updateError } = await supabase
      .from('artists')
      .update({ 
        slug: cleanSlug,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating slug:', updateError);
      return NextResponse.json({ error: 'Failed to update slug' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      artist: updatedArtist,
      message: `Slug updated to: ${cleanSlug}`,
      newUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${cleanSlug}/subscribe`
    });

  } catch (error) {
    console.error('Update slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}