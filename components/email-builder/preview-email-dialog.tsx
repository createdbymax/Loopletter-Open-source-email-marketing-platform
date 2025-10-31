'use client';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { SubscriptionPlan } from '@/lib/subscription';
import { generateEmailHtml } from '@/lib/email-generator';
interface PreviewEmailDialogProps {
    subject: string;
    previewText: string;
    editor: Editor | null;
    subscriptionPlan?: SubscriptionPlan;
}
export function PreviewEmailDialog({ subject, previewText, editor, subscriptionPlan = 'starter' }: PreviewEmailDialogProps) {
    const [open, setOpen] = useState(false);
    const generatePreviewHtml = () => {
        if (!editor)
            return '';
        return generateEmailHtml({
            title: subject || 'Email Preview',
            previewText,
            content: editor.getHTML(),
            subscriptionPlan
        });
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center rounded-md bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-black dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50" disabled={!editor}>
          <EyeIcon className="mr-1 inline-block size-4"/>
          Preview
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{subject || 'Email Preview'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 h-[500px]">
          <iframe srcDoc={generatePreviewHtml()} title="Email Preview" className="w-full h-full border dark:border-neutral-700 rounded bg-white"/>
        </div>
      </DialogContent>
    </Dialog>);
}
