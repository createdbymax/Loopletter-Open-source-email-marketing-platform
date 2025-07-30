import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEarlyAccessConfirmationEmail } from '@/lib/email-sender';

interface EarlyAccessRequest {
  // Essential Information
  name: string;
  email: string;
  role: 'artist' | 'manager' | 'label' | 'other';
  otherRole?: string;
  
  // Music & Audience Context
  musicLinks: string[];
  fanBaseSize: '0-100' | '100-1K' | '1K-10K' | '10K-50K' | '50K+';
  genre: string;
  
  // Current Marketing Approach
  currentReachMethods: string[];
  currentEmailPlatform?: string;
  
  // Goals & Expectations
  mainGoals: string[];
  emailFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'announcements';
  
  // Beta Participation
  openToBetaFeedback: boolean;
  preferredCommunication: 'email' | 'in-app';
  
  // Optional Context
  whyLoopletter?: string;
  biggestChallenge?: string;
  additionalContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: EarlyAccessRequest = await request.json();

    // Validate required fields
    if (!data.email || !data.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!data.name || !data.role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    if (!data.musicLinks.some(link => link.trim()) || !data.genre) {
      return NextResponse.json(
        { error: 'At least one music link and genre are required' },
        { status: 400 }
      );
    }

    if (data.currentReachMethods.length === 0 || data.mainGoals.length === 0) {
      return NextResponse.json(
        { error: 'Current reach methods and main goals are required' },
        { status: 400 }
      );
    }

    // Check if email already exists in early access requests
    const { data: existingEntry, error: checkError } = await supabase
      .from('early_access_requests')
      .select('email')
      .eq('email', data.email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing early access request:', checkError);
      return NextResponse.json(
        {
          error: 'Failed to process request',
          details: checkError.message,
          code: checkError.code
        },
        { status: 500 }
      );
    }

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already registered for early access' },
        { status: 409 }
      );
    }

    // Clean up music links (remove empty ones)
    const cleanMusicLinks = data.musicLinks.filter(link => link.trim());

    // Insert early access request
    const { error: insertError } = await supabase
      .from('early_access_requests')
      .insert([
        {
          email: data.email.toLowerCase(),
          name: data.name,
          role: data.role,
          other_role: data.otherRole,
          music_links: cleanMusicLinks,
          fan_base_size: data.fanBaseSize,
          genre: data.genre,
          current_reach_methods: data.currentReachMethods,
          current_email_platform: data.currentEmailPlatform,
          main_goals: data.mainGoals,
          email_frequency: data.emailFrequency,
          open_to_beta_feedback: data.openToBetaFeedback,
          preferred_communication: data.preferredCommunication,
          why_loopletter: data.whyLoopletter,
          biggest_challenge: data.biggestChallenge,
          additional_context: data.additionalContext,
          source: 'website',
          status: 'pending'
        }
      ]);

    if (insertError) {
      console.error('Error inserting early access request:', insertError);
      return NextResponse.json(
        {
          error: 'Failed to submit early access request',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    // Get current request count for the confirmation email
    const { count } = await supabase
      .from('early_access_requests')
      .select('*', { count: 'exact', head: true });

    // Send confirmation email
    try {
      await sendEarlyAccessConfirmationEmail({
        to: data.email,
        name: data.name,
        requestCount: count || undefined
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the signup if email fails - user request is still submitted
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Early access request submitted successfully! Check your email for confirmation.'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Early access request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get simple count for display
    const { count, error } = await supabase
      .from('early_access_requests')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching early access request count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch early access data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ total: count || 0 });

  } catch (error) {
    console.error('Early access fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}