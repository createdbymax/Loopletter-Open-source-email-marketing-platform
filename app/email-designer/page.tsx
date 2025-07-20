'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Dynamically import the EmailEditor component with no SSR
const EmailEditor = dynamic(() => import('@/components/email-builder/EmailEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    </div>
  )
});

export default function EmailDesignerPage() {
  const router = useRouter();
  const [showReplyTo, setShowReplyTo] = useState(false);
  
  // Email metadata
  const [emailData, setEmailData] = useState({
    subject: '',
    from: '',
    to: '',
    replyTo: '',
    previewText: '',
  });
  
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Email Designer</h1>
        </div>
      </div>
      
      <div className="max-w-[680px] mx-auto px-4 sm:px-10 py-6">
        <Label className="flex items-center font-normal">
          <span className="w-20 shrink-0 font-normal text-gray-600 after:ml-0.5 after:text-red-400 after:content-['*']">
            Subject
          </span>
          <Input
            className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Email Subject"
            type="text"
            value={emailData.subject}
            onChange={(event) => setEmailData(prev => ({ ...prev, subject: event.target.value }))}
          />
        </Label>
        
        <div className="flex items-center gap-1.5">
          <Label className="flex grow items-center font-normal">
            <span className="w-20 shrink-0 font-normal text-gray-600">
              From
            </span>
            <Input
              className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Your Name <your-email@domain.com>"
              type="text"
              value={emailData.from}
              onChange={(event) => setEmailData(prev => ({ ...prev, from: event.target.value }))}
            />
          </Label>
          
          {!showReplyTo && (
            <button
              className="inline-block h-full shrink-0 bg-transparent px-1 text-sm text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              type="button"
              onClick={() => {
                setShowReplyTo(true);
              }}
            >
              Reply-To
            </button>
          )}
        </div>
        
        {showReplyTo && (
          <Label className="flex items-center font-normal">
            <span className="w-20 shrink-0 font-normal text-gray-600">
              Reply-To
            </span>
            <div className="align-content-stretch flex grow items-center">
              <Input
                className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="reply-to@domain.com"
                type="text"
                value={emailData.replyTo}
                onChange={(event) => setEmailData(prev => ({ ...prev, replyTo: event.target.value }))}
              />
              <button
                className="flex h-10 shrink-0 items-center bg-transparent px-1 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => {
                  setEmailData(prev => ({ ...prev, replyTo: '' }));
                  setShowReplyTo(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </Label>
        )}
        
        <Label className="flex items-center font-normal">
          <span className="w-20 shrink-0 font-normal text-gray-600">
            To
          </span>
          <Input
            className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Email Recipient(s)"
            type="text"
            value={emailData.to}
            onChange={(event) => setEmailData(prev => ({ ...prev, to: event.target.value }))}
          />
        </Label>
        
        <div className="relative my-6">
          <Input
            className="h-auto rounded-none border-x-0 border-gray-300 px-0 py-2.5 pr-5 text-base focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Preview Text"
            type="text"
            value={emailData.previewText}
            onChange={(event) => setEmailData(prev => ({ ...prev, previewText: event.target.value }))}
          />
          <TooltipProvider>
            <span className="absolute right-0 top-0 flex h-full items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Preview text appears in the inbox after the subject line. 
                    It provides recipients with a glimpse of the email content.
                  </p>
                </TooltipContent>
              </Tooltip>
            </span>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex-1 px-4">
        <EmailEditor 
          onSave={(html, json) => console.log('Saved HTML:', html, json)}
          onSend={(html, json) => console.log('Sending HTML:', html, json)}
          autofocus="end"
        />
      </div>
    </div>
  );
}