'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EmailEditorSandbox } from '@/components/email-builder/email-editor-sandbox';
import { toast } from 'sonner';

export default function EmailDesignerPage() {
  const router = useRouter();

  // Test email send function
  const handleSendTest = async (data: { 
    subject: string; 
    previewText: string; 
    from: string; 
    to: string; 
    replyTo: string; 
    content: string 
  }) => {
    try {
      const response = await fetch('/api/campaigns/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
          previewText: data.previewText,
          content: data.content,
          to: data.to,
          from: data.from,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email');
      }

      toast.success(`Test email sent to ${data.to}`);
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Email Designer</h1>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Create beautiful emails with Maily.to
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EmailEditorSandbox
          template={{
            title: "My Email Campaign",
            preview_text: "Check out what's new!",
            content: JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Start writing your email content here..."
                    }
                  ]
                }
              ]
            })
          }}
          onSave={async (data) => {
            console.log('Saved:', data);
            toast.success("Email saved as draft");
          }}
          onUpdate={async (data) => {
            console.log('Sent:', data);
            toast.success("Email sent successfully!");
          }}
          onSendTest={handleSendTest}
          fanCount={0}
          subscriptionPlan="starter"
        />
      </div>
    </div>
  );
}