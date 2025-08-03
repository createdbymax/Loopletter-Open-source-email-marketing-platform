'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailEditorSandbox } from './email-editor-sandbox';
import { toast } from 'sonner';
import { getEmailTemplateContent } from '@/lib/email-templates';
import defaultEmailJSON from '@/lib/default-editor-json.json';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { SubscriptionPlan } from '@/lib/subscription';
import { generateEmailHtml } from '@/lib/email-generator';

interface MailyEditorProps {
  onBack: () => void;
  onSave: (htmlContent: string) => void;
  onSend: (data: { subject: string; previewText: string; content: string }) => void;
  initialHtml?: string;
  templateData?: unknown;
  templateId?: string;
  fanCount?: number;
  subscriptionPlan?: SubscriptionPlan;
  subject?: string;
  previewText?: string;
  fromName?: string;
  artist?: any; // Add artist data
}

export function MailyEditor({ 
  onBack, 
  onSave, 
  onSend, 
  initialHtml = '', 
  templateData, 
  templateId, 
  fanCount = 0,
  subscriptionPlan = 'starter',
  subject = '',
  previewText = '',
  artist
}: MailyEditorProps) {
  const [, setIsSaving] = useState(false);
  const [, setIsSending] = useState(false);
  const [editor, setEditorInstance] = useState<TiptapEditor | null>(null);
  
  // Debug editor instance changes
  const handleSetEditor = (newEditor: TiptapEditor | null) => {
      // Editor instance changed
    setEditorInstance(newEditor);
  };

  const handleSave = async (data: { title: string; previewText: string; content: string }) => {
    console.log('MailyEditor - handleSave called with data:', data);
    console.log('MailyEditor - Editor instance exists:', !!editor);
    
    if (!editor) {
      console.error('MailyEditor - Editor not initialized');
      toast.error('Editor not initialized');
      return;
    }
    
    setIsSaving(true);
    try {
      // Get HTML directly from the editor
      const editorHtml = editor.getHTML();
      console.log('MailyEditor - Editor HTML length:', editorHtml.length);
      console.log('MailyEditor - Editor HTML preview:', editorHtml.substring(0, 200) + '...');
      
      // Use the editor HTML content directly - don't wrap it in generateEmailHtml
      // The campaign editor will handle the final HTML generation
      onSave(editorHtml);
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async (data?: { title: string; previewText: string; content: string }) => {
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }
    
    setIsSending(true);
    try {
      // Get HTML directly from the editor
      const editorHtml = editor.getHTML();
      
      console.log('Sending campaign with content length:', editorHtml.length);
      
      // Pass the subject, preview text, and content to the campaign editor
      await onSend({
        subject: data?.title || subject,
        previewText: data?.previewText || previewText,
        content: editorHtml
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async (data: { 
    subject: string; 
    previewText: string; 
    from: string; 
    to: string; 
    replyTo: string; 
    content: string 
  }) => {
    if (!data.to) {
      throw new Error('Recipient email is required');
    }

    if (!data.subject) {
      throw new Error('Subject is required');
    }

    if (!data.content) {
      throw new Error('Content is required');
    }
    
    try {
      // Generate the complete HTML email for the test
      const completeHtml = generateEmailHtml({
        title: data.subject,
        previewText: data.previewText,
        content: data.content,
        subscriptionPlan
      });
      
      const response = await fetch('/api/campaigns/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
          previewText: data.previewText,
          content: completeHtml,
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
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
          template={useMemo(() => {
            let content = initialHtml;
            
            // If no initial HTML, try to use template data
            if (!content && templateData && typeof templateData === 'object' && 'mailyJson' in templateData) {
              try {
                // Validate that mailyJson has the expected structure
                const mailyJson = templateData.mailyJson as any;
                if (mailyJson && typeof mailyJson === 'object' && mailyJson.type === 'doc' && Array.isArray(mailyJson.content)) {
                  content = JSON.stringify(mailyJson);
                } else {
                  content = '<p>Start writing your email content here...</p>';
                }
              } catch (error) {
                content = '<p>Start writing your email content here...</p>';
              }
            }
            
            // Final fallback
            if (!content) {
              content = '<p>Start writing your email content here...</p>';
            }
            
            return { 
              // Don't set ID for Spotify-generated templates to use EmailEditor instead of DirectTemplateEditor
              id: templateId === 'spotify-generated' ? undefined : templateId,
              title: subject || (templateData && typeof templateData === 'object' && 'subject' in templateData ? 
                String(templateData.subject) : ''),
              preview_text: previewText || (templateData && typeof templateData === 'object' && 'previewText' in templateData ? 
                String(templateData.previewText) : ''),
              content: content
            };
          }, [initialHtml, templateData, templateId, subject, previewText])}
          onSave={handleSave}
          onUpdate={handleSend}
          onSendTest={handleSendTest}
          setEditor={handleSetEditor}
          autofocus="end"
          fanCount={fanCount}
          subscriptionPlan={subscriptionPlan}
          artist={artist}
        />
      </div>
    </div>
  );
}