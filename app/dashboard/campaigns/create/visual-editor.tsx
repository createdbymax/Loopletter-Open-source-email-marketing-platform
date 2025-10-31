"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VisualEmailBuilder, EmailTemplate, EmailBlock, } from "@/components/email-builder/visual-email-builder";
import { ArrowLeft, Save, Send } from "lucide-react";
interface VisualEditorProps {
    onBack: () => void;
    onSave: (htmlContent: string) => void;
    onSend: (htmlContent: string) => void;
    initialHtml?: string;
}
export function VisualEditor({ onBack, onSave, onSend, initialHtml, }: VisualEditorProps) {
    const [generatedHtml, setGeneratedHtml] = useState<string>("");
    useEffect(() => {
        const checkIframe = () => {
            const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
            if (iframe && iframe.contentDocument) {
                setGeneratedHtml(iframe.srcdoc || "");
            }
        };
        checkIframe();
        const interval = setInterval(checkIframe, 1000);
        return () => clearInterval(interval);
    }, []);
    const getInitialBlocks = (): EmailBlock[] => {
        if (!initialHtml)
            return [];
        return [
            {
                id: "1",
                type: "paragraph",
                content: initialHtml,
            },
        ];
    };
    const handleSaveClick = () => {
        const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
        if (iframe && iframe.srcdoc) {
            onSave(iframe.srcdoc);
        }
        else if (generatedHtml) {
            onSave(generatedHtml);
        }
    };
    const handleSendClick = () => {
        const iframe = document.getElementById("preview-iframe") as HTMLIFrameElement;
        if (iframe && iframe.srcdoc) {
            onSend(iframe.srcdoc);
        }
        else if (generatedHtml) {
            onSend(generatedHtml);
        }
    };
    return (<div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back
          </Button>
          <h2 className="text-xl font-semibold">Visual Email Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveClick}>
            <Save className="h-4 w-4 mr-2"/>
            Save Draft
          </Button>
          <Button onClick={handleSendClick}>
            <Send className="h-4 w-4 mr-2"/>
            Continue to Send
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <VisualEmailBuilder initialBlocks={getInitialBlocks()} onChange={(blocks) => {
            const html = blocks.map(block => `<div>${block.content}</div>`).join('');
            setGeneratedHtml(html);
        }}/>
      </div>
    </div>);
}
