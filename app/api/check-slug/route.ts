import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' 
      });
    }

    // Check if slug is reserved
    const reservedSlugs = [
      'api', 'dashboard', 'admin', 'www', 'mail', 'ftp', 'localhost',
      'sign-in', 'signin', 'login', 'signup', 'sign-up', 'register',
      'about', 'contact', 'privacy', 'terms', 'help', 'support',
      'blog', 'news', 'docs', 'documentation', 'status', 'health'
    ];

    if (reservedSlugs.includes(slug.toLowerCase())) {
      return NextResponse.json({ 
        available: false, 
        error: 'This slug is reserved and cannot be used.' 
      });
    }

    // Check if slug already exists (excluding current user)
    const { data: existingArtist, error } = await supabase
      .from('artists')
      .select('id, clerk_user_id')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking slug:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no existing artist found, slug is available
    if (!existingArtist) {
      return NextResponse.json({ available: true });
    }

    // If existing artist is the current user, slug is available for them
    if (existingArtist.clerk_user_id === user.id) {
      return NextResponse.json({ available: true });
    }

    // Slug is taken by another user
    return NextResponse.json({ 
      available: false, 
      error: 'This slug is already taken by another user.' 
    });

  } catch (error) {
    console.error('Error in check-slug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}