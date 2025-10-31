import { serve } from "std/http/server.ts";
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }
    try {
        const APP_URL = Deno.env.get('APP_URL') || 'https://loopletter.vercel.app/';
        const QUEUE_PROCESS_TOKEN = Deno.env.get('QUEUE_PROCESS_TOKEN');
        if (!QUEUE_PROCESS_TOKEN) {
            throw new Error('QUEUE_PROCESS_TOKEN environment variable is required');
        }
        console.log('Processing email queue...');
        const response = await fetch(`${APP_URL}/api/queue/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${QUEUE_PROCESS_TOKEN}`,
            },
            body: JSON.stringify({
                processNext: true,
                batchSize: 14
            }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(`Queue processing failed: ${result.error || 'Unknown error'}`);
        }
        console.log('Queue processing result:', result);
        return new Response(JSON.stringify({
            success: true,
            processed: result.processed || 0,
            failed: result.failed || 0,
            total: result.total || 0,
            timestamp: new Date().toISOString(),
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
    catch (error) {
        console.error('Error processing queue:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
