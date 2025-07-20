"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  VisualEmailBuilder,
  EmailTemplate,
} from "@/components/email-builder/visual-email-builder";
import { ArrowLeft, Save, Send } from "lucide-react";

interface VisualEditorProps {
  onBack: () => void;
  onSave: (htmlContent: string) => void;
  onSend: (htmlContent: string) => void;
  initialHtml?: string;
}

export function VisualEditor({
  onBack,
  onSave,
  onSend,
  initialHtml,
}: VisualEditorProps) {
  const [generatedHtml, setGeneratedHtml] = useState<string>("");

  // Get HTML from iframe when it's available
  useEffect(() => {
    const checkIframe = () => {
      const iframe = document.getElementById(
        "preview-iframe"
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        setGeneratedHtml(iframe.srcdoc || "");
      }
    };

    // Check immediately and then periodically
    checkIframe();
    const interval = setInterval(checkIframe, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert HTML to template format if initialHtml is provided
  const getInitialTemplate = (): EmailTemplate | undefined => {
    if (!initialHtml) return undefined;

    // This is a simplified conversion - in a real implementation,
    // you would need a more sophisticated HTML parser
    return {
      blocks: [
        {
          id: "1",
          type: "text",
          content: initialHtml,
          styles: {
            fontSize: 16,
            color: "#333333",
          },
        },
      ],
      styles: {
        backgroundColor: "#f5f5f5",
        width: "600px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      },
    };
  };

  const handleSaveClick = () => {
    const iframe = document.getElementById(
      "preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe && iframe.srcdoc) {
      onSave(iframe.srcdoc);
    } else if (generatedHtml) {
      onSave(generatedHtml);
    }
  };

  const handleSendClick = () => {
    const iframe = document.getElementById(
      "preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe && iframe.srcdoc) {
      onSend(iframe.srcdoc);
    } else if (generatedHtml) {
      onSend(generatedHtml);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">Visual Email Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveClick}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSendClick}>
            <Send className="h-4 w-4 mr-2" />
            Continue to Send
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <VisualEmailBuilder
          initialTemplate={getInitialTemplate()}
          onChange={(template) => {
            // This will be handled by the useEffect that checks the iframe
          }}
          onPreview={() => {
            // Preview is handled internally by the VisualEmailBuilder
          }}
          onSave={() => {
            // When the user clicks save in the builder, we'll save the campaign
            const iframe = document.getElementById(
              "preview-iframe"
            ) as HTMLIFrameElement;
            if (iframe && iframe.srcdoc) {
              onSave(iframe.srcdoc);
            } else if (generatedHtml) {
              onSave(generatedHtml);
            }
          }}
        />
      </div>
    </div>
  );
}
