import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateArtistByClerkId } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { Fan, SegmentCondition } from '@/lib/types';
const SegmentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    conditions: z.array(z.object({
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
    })).min(1, 'At least one condition is required'),
});
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        const { data: segments, error } = await supabase
            .from('segments')
            .select('*')
            .eq('artist_id', artist.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching segments:', error);
            return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
        }
        const segmentsWithCounts = await Promise.all(segments.map(async (segment) => {
            const fanCount = await calculateSegmentFanCount(segment.id, artist.id);
            return { ...segment, fan_count: fanCount };
        }));
        return NextResponse.json(segmentsWithCounts);
    }
    catch (error) {
        console.error('Error fetching segments:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const artist = await getOrCreateArtistByClerkId(userId, '', '');
        const body = await request.json();
        const validatedData = SegmentSchema.parse(body);
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
        const fanCount = await calculateSegmentFanCount(segment.id, artist.id);
        await supabase
            .from('segments')
            .update({ fan_count: fanCount })
            .eq('id', segment.id);
        return NextResponse.json({ ...segment, fan_count: fanCount });
    }
    catch (error) {
        console.error('Error creating segment:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Validation error',
                details: error.issues
            }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function calculateSegmentFanCount(segmentId: string, artistId: string): Promise<number> {
    try {
        const { data: segment } = await supabase
            .from('segments')
            .select('conditions')
            .eq('id', segmentId)
            .single();
        if (!segment) {
            return 0;
        }
        const { data: fans } = await supabase
            .from('fans')
            .select('*')
            .eq('artist_id', artistId)
            .eq('status', 'subscribed');
        if (!fans) {
            return 0;
        }
        const filteredFans = fans.filter(fan => {
            return evaluateConditions(fan, segment.conditions);
        });
        return filteredFans.length;
    }
    catch (error) {
        console.error('Error calculating segment fan count:', error);
        return 0;
    }
}
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
        }
        else {
            result = result || evaluateCondition(fan, condition);
        }
    }
    return result;
}
function evaluateCondition(fan: Fan, condition: SegmentCondition): boolean {
    const { field, operator, value } = condition;
    if (field === 'tags') {
        const fanTags = fan.tags || [];
        switch (operator) {
            case 'contains':
                return typeof value === 'string' && fanTags.includes(value);
            case 'not_contains':
                return typeof value === 'string' && !fanTags.includes(value);
            case 'in':
                return Array.isArray(value) && value.some(tag => fanTags.includes(tag));
            case 'not_in':
                return Array.isArray(value) && !value.some(tag => fanTags.includes(tag));
            default:
                return false;
        }
    }
    if (field.startsWith('custom_fields.')) {
        const customField = field.replace('custom_fields.', '');
        const customValue = fan.custom_fields?.[customField];
        return compareValues(customValue, operator, value);
    }
    const fanValue = (fan as any)[field];
    return compareValues(fanValue, operator, value);
}
function compareValues(a: unknown, operator: string, b: unknown): boolean {
    switch (operator) {
        case 'equals':
            return a === b;
        case 'not_equals':
            return a !== b;
        case 'contains':
            return typeof a === 'string' && typeof b === 'string' && a.includes(b);
        case 'not_contains':
            return typeof a === 'string' && typeof b === 'string' && !a.includes(b);
        case 'greater_than':
            return typeof a === 'number' && typeof b === 'number' && a > b;
        case 'less_than':
            return typeof a === 'number' && typeof b === 'number' && a < b;
        case 'in':
            return Array.isArray(b) && b.includes(a);
        case 'not_in':
            return Array.isArray(b) && !b.includes(a);
        default:
            return false;
    }
}
