import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;

    const { data: job, error } = await supabase
      .from('import_jobs')
      .select(`
        *,
        artists!inner(clerk_user_id)
      `)
      .eq('id', jobId)
      .eq('artists.clerk_user_id', user.id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      total_records: job.total_records,
      processed_records: job.processed_records,
      successful_imports: job.successful_imports,
      failed_imports: job.failed_imports,
      result: job.result,
      error_message: job.error_message,
      created_at: job.created_at,
      completed_at: job.completed_at
    });

  } catch (error) {
    console.error('Error fetching import job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import job' },
      { status: 500 }
    );
  }
}