'use client';

import { Editor } from '@maily-to/core';
import '@maily-to/core/style.css';
import type { Editor as TiptapEditor, FocusPosition } from '@tiptap/core';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/classname';
import defaultEmailJSON from '@/lib/default-editor-json.json';
import { getEmailTemplateContent } from '@/lib/email-templates';
import { convertTemplateToMailyFormat } from '@/lib/email-templates/template-converter';

interface DirectTemplateEditorProps {
  templateId?: string;
  setEditor?: (editor: TiptapEditor) => void;
  autofocus?: FocusPosition;
}

export function DirectTemplateEditor({ templateId, setEditor, autofocus }: DirectTemplateEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Get the template content based on the template ID
  const getTemplateContent = () => {
    if (!templateId) {
      console.log('No template ID provided, using default email JSON');
      return defaultEmailJSON;
    }

    // Special handling for blank template
    if (templateId === 'blank') {
      console.log('Using blank template');
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              textAlign: "left"
            },
            content: [
              {
                type: "text",
                text: ""
              }
            ]
          }
        ]
      };
    }

    // For other templates, use the template content from our library
    const templateContent = getEmailTemplateContent(templateId);
    console.log(`Loading template: ${templateId}`, templateContent);
    
    // If we have a valid template content, convert it to Maily format and return it
    if (templateContent && typeof templateContent === 'object') {
      const convertedTemplate = convertTemplateToMailyFormat(templateContent);
      console.log(`Converted template: ${templateId}`, convertedTemplate);
      return convertedTemplate;
    }
    
    // Fallback to default email JSON
    console.log('Template not found, using default email JSON');
    return defaultEmailJSON;
  };

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-[600px]">Loading editor...</div>;
  }

  return (
    <div className="max-w-[calc(600px+80px)] mx-auto px-10 pb-10">
      <Editor
        config={{
          hasMenuBar: false,
          wrapClassName: cn('editor-wrap w-full bg-[var(--mly-body-background-color)] px-[var(--mly-body-padding-left)] py-[var(--mly-body-padding-top)] [font-family:var(--mly-font)]'),
          bodyClassName: 'editor-body bg-transparent! !mt-0 !border-0 !p-0 w-full',
          contentClassName: `editor-content mx-auto max-w-[var(--mly-container-max-width)]! bg-[var(--mly-container-background-color)] px-[var(--mly-container-padding-left)]! py-[var(--mly-container-padding-top)]! rounded-[var(--mly-container-border-radius)]! [border-width:var(--mly-container-border-width)]! [border-color:var(--mly-container-border-color)]!`,
          toolbarClassName: 'flex-wrap !items-start',
          spellCheck: false,
          autofocus: autofocus || 'end',
          immediatelyRender: false,
        }}
        contentJson={getTemplateContent()}
        onReady={(editor) => {
          if (setEditor) {
            setEditor(editor);
          }
        }}
        onUpdate={(editor) => {
          if (setEditor) {
            setEditor(editor);
          }
        }}
        className="min-h-[600px] border border-gray-200 rounded-md"
      />
    </div>
  );
}