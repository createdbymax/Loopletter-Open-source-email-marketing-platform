"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { Editor as TiptapEditor, FocusPosition } from "@tiptap/core";

// Dynamically import the TipTap editor to avoid SSR issues
const TiptapEmailEditor = dynamic(() => import("./TiptapEmailEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

interface EmailEditorProps {
  defaultContent?: string;
  onSave?: (html: string, json: Record<string, unknown>) => void;
  onSend?: (html: string, json: Record<string, unknown>) => void;
  setEditor?: (editor: TiptapEditor) => void;
  autofocus?: FocusPosition;
}

export default function EmailEditor(props: EmailEditorProps) {
  return <TiptapEmailEditor {...props} />;
}
