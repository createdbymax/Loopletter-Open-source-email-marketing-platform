'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor as TiptapEditor, FocusPosition } from '@tiptap/core';
import { Loader2, Save, Copy, Eye, FileCode, Asterisk, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Image as ImageIcon, Underline as UnderlineIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
interface EmailEditorProps {
    defaultContent?: string;
    onSave?: (html: string, json: Record<string, unknown>) => void;
    onSend?: (html: string, json: Record<string, unknown>) => void;
    setEditor?: (editor: TiptapEditor) => void;
    autofocus?: FocusPosition;
}
const defaultEmailJSON = {
    "type": "doc",
    "content": [
        {
            "type": "heading",
            "attrs": {
                "level": 1,
                "textAlign": "center"
            },
            "content": [
                {
                    "type": "text",
                    "text": "Welcome to Your Email Designer"
                }
            ]
        },
        {
            "type": "paragraph",
            "attrs": {
                "textAlign": "center"
            },
            "content": [
                {
                    "type": "text",
                    "text": "Start designing beautiful emails with our easy-to-use editor."
                }
            ]
        }
    ]
};
export default function TiptapEmailEditor({ defaultContent, onSave, onSend, setEditor, autofocus = 'end' }: EmailEditorProps) {
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [showHtmlDialog, setShowHtmlDialog] = useState(false);
    const parsedContent = useMemo(() => {
        if (!defaultContent)
            return defaultEmailJSON;
        try {
            return JSON.parse(defaultContent);
        }
        catch (e) {
            return defaultContent;
        }
    }, [defaultContent]);
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Underline,
            Placeholder.configure({
                placeholder: 'Start writing your email content here...',
            }),
        ],
        content: typeof parsedContent === 'string' ? parsedContent : undefined,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] p-4',
            },
        },
        autofocus,
        onUpdate: ({ editor }) => {
        },
        immediatelyRender: false,
    });
    useEffect(() => {
        if (editor && setEditor) {
            setEditor(editor);
        }
    }, [editor, setEditor]);
    const getHtmlContent = () => {
        if (editor) {
            return editor.getHTML();
        }
        return '';
    };
    const getJsonContent = () => {
        if (editor) {
            return editor.getJSON();
        }
        return null;
    };
    const generateFullHtml = () => {
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    img { max-width: 100%; height: auto; }
    .prose h1, .prose h2, .prose h3, .prose h4 {
      margin-top: 1.25em;
      margin-bottom: 0.75em;
    }
    .prose p {
      margin-bottom: 1em;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="container">
    ${getHtmlContent()}
  </div>
</body>
</html>
`;
    };
    const handleSave = () => {
        const html = generateFullHtml();
        const json = getJsonContent();
        if (onSave && json) {
            onSave(html, json);
        }
    };
    const handleSend = () => {
        const html = generateFullHtml();
        const json = getJsonContent();
        if (onSend && json) {
            onSend(html, json);
        }
    };
    const copyHtmlToClipboard = () => {
        navigator.clipboard.writeText(generateFullHtml());
        alert('HTML copied to clipboard!');
    };
    useEffect(() => {
        setIsClient(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);
    if (!isClient) {
        return (<div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    return (<div className="flex flex-col">
      
      <div className="relative">
        {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          </div>)}
        
        <div className="max-w-[680px] mx-auto border border-gray-200 rounded-md">
          
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-gray-200' : ''}>
              <Bold className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-gray-200' : ''}>
              <Italic className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-gray-200' : ''}>
              <UnderlineIcon className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().setTextAlign('left').run()} className={editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}>
              <AlignLeft className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().setTextAlign('center').run()} className={editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}>
              <AlignCenter className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().setTextAlign('right').run()} className={editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}>
              <AlignRight className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
            const url = window.prompt('Enter link URL:');
            if (url) {
                editor?.chain().focus().setLink({ href: url }).run();
            }
        }} className={editor?.isActive('link') ? 'bg-gray-200' : ''}>
              <LinkIcon className="h-4 w-4"/>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
                editor?.chain().focus().setImage({ src: url }).run();
            }
        }}>
              <ImageIcon className="h-4 w-4"/>
            </Button>
          </div>
          
          
          <EditorContent editor={editor} className="min-h-[500px]"/>
        </div>
      </div>

      
      <div className="fixed bottom-6 right-6 flex gap-2">
        <Dialog open={showHtmlDialog} onOpenChange={setShowHtmlDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
              <FileCode className="h-4 w-4"/>
              <span className="sr-only">View HTML</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Email HTML</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content HTML</TabsTrigger>
                <TabsTrigger value="full">Full Email HTML</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="pt-3">
                <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-auto">
                  {getHtmlContent()}
                </pre>
              </TabsContent>
              <TabsContent value="full" className="pt-3">
                <pre className="bg-gray-100 p-4 rounded text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-auto">
                  {generateFullHtml()}
                </pre>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={copyHtmlToClipboard}>
                <Copy className="h-4 w-4 mr-2"/>
                Copy HTML
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
              <Eye className="h-4 w-4"/>
              <span className="sr-only">Preview</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>
            <div className="mt-4 h-[500px]">
              <iframe srcDoc={generateFullHtml()} title="Email Preview" className="w-full h-full border rounded"/>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0" onClick={handleSend}>
          <Asterisk className="h-4 w-4"/>
          <span className="sr-only">Send Test</span>
        </Button>

        <Button variant="default" size="sm" className="rounded-full h-10 w-10 p-0" onClick={handleSave}>
          <Save className="h-4 w-4"/>
          <span className="sr-only">Save</span>
        </Button>
      </div>
    </div>);
}
