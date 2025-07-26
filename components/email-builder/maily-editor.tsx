'use client';

import { useState } from 'react';
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
  onSend: (htmlContent: string) => void;
  initialHtml?: string;
  templateData?: unknown;
  templateId?: string;
  fanCount?: number;
  subscriptionPlan?: SubscriptionPlan;
}

export function MailyEditor({ 
  onBack, 
  onSave, 
  onSend, 
  initialHtml = '', 
  templateData, 
  templateId, 
  fanCount = 0,
  subscriptionPlan = 'starter' 
}: MailyEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editor, setEditorInstance] = useState<TiptapEditor | null>(null);

  const handleSave = async (data: { title: string; previewText: string; content: string }) => {
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }
    
    setIsSaving(true);
    try {
      // Get HTML directly from the editor
      const editorHtml = editor.getHTML();
      
      // Generate the complete HTML email with footer if on starter plan
      const html = generateEmailHtml({
        title: data.title,
        previewText: data.previewText,
        content: editorHtml,
        subscriptionPlan
      });
      
      onSave(html);
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async (data: { title: string; previewText: string; content: string }) => {
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }
    
    setIsSending(true);
    try {
      // Get HTML directly from the editor
      const editorHtml = editor.getHTML();
      
      // Generate the complete HTML email with footer if on starter plan
      const html = generateEmailHtml({
        title: data.title,
        previewText: data.previewText,
        content: editorHtml,
        subscriptionPlan
      });
      
      onSend(html);
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
    
    // In a real implementation, you'd send a test email via API
    // This is just a mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Test email sent to ${data.to}`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Email Designer</h1>
            <p className="text-sm text-gray-600">
              Create beautiful emails with Maily.to
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EmailEditorSandbox
          template={(() => {
            const template = { 
              // Don't set ID for Spotify-generated templates to use EmailEditor instead of DirectTemplateEditor
              id: templateId === 'spotify-generated' ? undefined : templateId,
              title: templateData && typeof templateData === 'object' && 'subject' in templateData ? 
                String(templateData.subject) : '',
              preview_text: templateData && typeof templateData === 'object' && 'previewText' in templateData ? 
                String(templateData.previewText) : '',
              content: templateData && typeof templateData === 'object' && 'mailyJson' in templateData ? 
                JSON.stringify(templateData.mailyJson) : initialHtml
            };
            console.log('MailyEditor - Template object:', template);
            console.log('MailyEditor - Template data:', templateData);
            console.log('MailyEditor - Initial HTML:', initialHtml);
            return template;
          })()}
          onSave={handleSave}
          onUpdate={handleSend}
          onSendTest={handleSendTest}
          setEditor={setEditorInstance}
          autofocus="end"
          fanCount={fanCount}
          subscriptionPlan={subscriptionPlan}
        />
      </div>
    </div>
  );
}