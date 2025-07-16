import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

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
        available: false, 
        error: 'This slug is reserved and cannot be used' 
      });
    }

    // Check if slug exists in database
    const { data: existingArtist, error } = await supabase
      .from('artists')
      .select('id')
      .eq('slug', cleanSlug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking slug availability:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const available = !existingArtist;

    return NextResponse.json({ 
      available,
      slug: cleanSlug,
      message: available ? 'Slug is available' : 'Slug is already taken'
    });

  } catch (error) {
    console.error('Check slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}