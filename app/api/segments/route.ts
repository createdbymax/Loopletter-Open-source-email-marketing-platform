import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Fan, SegmentCondition } from '@/lib/types';

// Define schema for segment creation
const SegmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum([
        'equals', 
        'not_equals', 
        'contains', 
        'not_contains', 
        'greater_than', 
        'less_than', 
        'in', 
        'not_in'
      ]),
      value: z.any(),
      logic: z.enum(['and', 'or']).optional(),
    })
  ).min(1, 'At least one condition is required'),
});

// GET all segments for the current artist
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    // Get all segments for this artist
    const { data: segments, error } = await supabase
      .from('segments')
      .select('*')
      .eq('artist_id', artist.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching segments:', error);
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
    }

    // For each segment, calculate the fan count
    const segmentsWithCounts = await Promise.all(
      segments.map(async (segment) => {
        const fanCount = await calculateSegmentFanCount(segment.id, artist.id);
        return { ...segment, fan_count: fanCount };
      })
    );

    return NextResponse.json(segmentsWithCounts);
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new segment
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the artist associated with the current user
    const artist = await getOrCreateArtistByClerkId(userId, '', '');

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = SegmentSchema.parse(body);

    // Create the segment
    const { data: segment, error } = await supabase
      .from('segments')
      .insert({
        artist_id: artist.id,
        name: validatedData.name,
        description: validatedData.description || '',
        conditions: validatedData.conditions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating segment:', error);
      return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
    }

    // Calculate the fan count for this segment
    const fanCount = await calculateSegmentFanCount(segment.id, artist.id);

    // Update the segment with the fan count
    await supabase
      .from('segments')
      .update({ fan_count: fanCount })
      .eq('id', segment.id);

    return NextResponse.json({ ...segment, fan_count: fanCount });
  } catch (error) {
    console.error('Error creating segment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate the number of fans in a segment
async function calculateSegmentFanCount(segmentId: string, artistId: string): Promise<number> {
  try {
    // Get the segment conditions
    const { data: segment } = await supabase
      .from('segments')
      .select('conditions')
      .eq('id', segmentId)
      .single();

    if (!segment) {
      return 0;
    }

    // Get all fans for this artist
    const { data: fans } = await supabase
      .from('fans')
      .select('*')
      .eq('artist_id', artistId)
      .eq('status', 'subscribed');

    if (!fans) {
      return 0;
    }

    // Apply the segment conditions to filter the fans
    const filteredFans = fans.filter(fan => {
      return evaluateConditions(fan, segment.conditions);
    });

    return filteredFans.length;
  } catch (error) {
    console.error('Error calculating segment fan count:', error);
    return 0;
  }
}

// Helper function to evaluate segment conditions against a fan
function evaluateConditions(fan: Fan, conditions: SegmentCondition[]): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  let result = evaluateCondition(fan, conditions[0]);
  
  for (let i = 1; i < conditions.length; i++) {
    const condition = conditions[i];
    const logic = conditions[i - 1].logic || 'and';
    
    if (logic === 'and') {
      result = result && evaluateCondition(fan, condition);
    } else {
      result = result || evaluateCondition(fan, condition);
    }
  }
  
  return result;
}

// Helper function to evaluate a single condition
function evaluateCondition(fan: Fan, condition: SegmentCondition): boolean {
  const { field, operator, value } = condition;
  
  // Handle special fields
  if (field === 'tags') {
    const fanTags = fan.tags || [];
    
    switch (operator) {
      case 'contains':
        return fanTags.includes(value);
      case 'not_contains':
        return !fanTags.includes(value);
      case 'in':
        return Array.isArray(value) && value.some(tag => fanTags.includes(tag));
      case 'not_in':
        return Array.isArray(value) && !value.some(tag => fanTags.includes(tag));
      default:
        return false;
    }
  }
  
  // Handle custom fields
  if (field.startsWith('custom_fields.')) {
    const customField = field.replace('custom_fields.', '');
    const customValue = fan.custom_fields?.[customField];
    
    return compareValues(customValue, operator, value);
  }
  
  // Handle standard fields
  const fanValue = fan[field];
  return compareValues(fanValue, operator, value);
}

// Helper function to compare values based on operator
function compareValues(a: unknown, operator: string, b: unknown): boolean {
  switch (operator) {
    case 'equals':
      return a === b;
    case 'not_equals':
      return a !== b;
    case 'contains':
      return typeof a === 'string' && a.includes(b);
    case 'not_contains':
      return typeof a === 'string' && !a.includes(b);
    case 'greater_than':
      return a > b;
    case 'less_than':
      return a < b;
    case 'in':
      return Array.isArray(b) && b.includes(a);
    case 'not_in':
      return Array.isArray(b) && !b.includes(a);
    default:
      return false;
  }
}