'use client';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/lib/subscription';
import { generateEmailHtml } from '@/lib/email-generator';
interface CopyEmailHtmlProps {
    previewText: string;
    editor: Editor | null;
    subscriptionPlan?: SubscriptionPlan;
}
export function CopyEmailHtml({ previewText, editor, subscriptionPlan = 'starter' }: CopyEmailHtmlProps) {
    const [copied, setCopied] = useState(false);
    const generateFullHtml = () => {
        if (!editor)
            return '';
        return generateEmailHtml({
            title: 'Email',
            previewText,
            content: editor.getHTML(),
            subscriptionPlan
        });
    };
    const handleCopy = () => {
        const html = generateFullHtml();
        navigator.clipboard.writeText(html);
        setCopied(true);
        toast.success('HTML copied to clipboard');
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };
    return (<button className="flex items-center rounded-md bg-white dark:bg-neutral-700 px-2 py-1 text-sm text-black dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50" onClick={handleCopy} disabled={!editor}>
      {copied ? (<CheckIcon className="mr-1 inline-block size-4"/>) : (<CopyIcon className="mr-1 inline-block size-4"/>)}
      Copy HTML
    </button>);
}
