'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
const EmailEditor = dynamic(() => import('@/components/email-builder/EmailEditor'), {
    ssr: false,
    loading: () => (<div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>),
});
export default function EmailEditorTestPage() {
    const [emailHtml, setEmailHtml] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const handleSave = (html: string, json: Record<string, unknown>) => {
        setEmailHtml(html);
        setShowResult(true);
        console.log('Email saved:', { html, json });
    };
    const handleSend = (html: string, json: Record<string, unknown>) => {
        setEmailHtml(html);
        setShowResult(true);
        console.log('Email sent:', { html, json });
    };
    return (<div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Email Editor Test</h1>
      
      <div className="mb-8">
        <EmailEditor defaultContent="<h1>Test Email</h1><p>This is a test of our custom email editor.</p>" onSave={handleSave} onSend={handleSend}/>
      </div>
      
      {showResult && (<div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Email HTML</h2>
          <div className="border rounded-md p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm">{emailHtml}</pre>
          </div>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Email Preview</h2>
          <div className="border rounded-md">
            <iframe srcDoc={emailHtml} title="Email Preview" className="w-full h-[500px] border-0"/>
          </div>
          
          <div className="mt-4">
            <Button onClick={() => setShowResult(false)}>Hide Result</Button>
          </div>
        </div>)}
    </div>);
}
