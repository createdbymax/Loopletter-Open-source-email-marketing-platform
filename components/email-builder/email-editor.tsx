"use client";
import { Editor } from "@maily-to/core";
import "@maily-to/core/style.css";
import type { Editor as TiptapEditor, FocusPosition } from "@tiptap/core";
import { useEffect, useState } from "react";
import { cn } from "@/lib/classname";
import { debugTemplateLoading } from "@/lib/debug-utils";
import defaultEmailJSON from "@/lib/default-editor-json.json";
interface EmailEditorProps {
    defaultContent?: string;
    setEditor?: (editor: TiptapEditor | null) => void;
    autofocus?: FocusPosition;
}
export function EmailEditor({ defaultContent, setEditor, autofocus, }: EmailEditorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const parseContent = () => {
        if (!defaultContent) {
            console.log("No default content provided, using default email JSON");
            return defaultEmailJSON;
        }
        try {
            const parsedContent = JSON.parse(defaultContent);
            debugTemplateLoading("custom", parsedContent);
            return parsedContent;
        }
        catch (e) {
            console.warn("Content is not JSON, treating as HTML and converting to basic structure");
            return {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        attrs: { textAlign: "left" },
                        content: [
                            {
                                type: "text",
                                text: "Loading your content..."
                            }
                        ]
                    }
                ]
            };
        }
    };
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) {
        return (<div className="flex items-center justify-center h-[600px] text-neutral-600 dark:text-neutral-400">
        Loading editor...
      </div>);
    }
    return (<div className="max-w-[calc(600px+80px)] mx-auto px-10 pb-10">
      <div className="min-h-[600px] border border-gray-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800">
        <Editor config={{
            hasMenuBar: false,
            wrapClassName: cn("editor-wrap w-full bg-[var(--mly-body-background-color)] px-[var(--mly-body-padding-left)] py-[var(--mly-body-padding-top)] [font-family:var(--mly-font)]"),
            bodyClassName: "editor-body bg-transparent! !mt-0 !border-0 !p-0 w-full",
            contentClassName: `editor-content mx-auto max-w-[var(--mly-container-max-width)]! bg-[var(--mly-container-background-color)] px-[var(--mly-container-padding-left)]! py-[var(--mly-container-padding-top)]! rounded-[var(--mly-container-border-radius)]! [border-width:var(--mly-container-border-width)]! [border-color:var(--mly-container-border-color)]!`,
            toolbarClassName: "flex-wrap !items-start",
            spellCheck: false,
            autofocus: autofocus || "end",
            immediatelyRender: false,
        }} contentJson={parseContent()} onCreate={(editor) => {
            if (setEditor) {
                setEditor(editor);
            }
        }} onUpdate={(editor) => {
            if (setEditor) {
                setEditor(editor);
            }
        }}/>
      </div>
    </div>);
}
