"use client";

import { useState } from "react";
import type { Editor, FocusPosition } from "@tiptap/core";
import {
  FileCogIcon,
  Loader2Icon,
  SaveIcon,
  XIcon,
  AsteriskIcon,
  SendIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/classname";
import { EmailEditor } from "./email-editor";
import { DirectTemplateEditor } from "./direct-template-editor";
import { PreviewEmailDialog } from "./preview-email-dialog";
import { PreviewTextInfo } from "./preview-text-info";
import { CopyEmailHtml } from "./copy-email-html";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import defaultEmailJSON from "@/lib/default-editor-json.json";
import { SubscriptionPlan } from "@/lib/subscription";
import { FooterPreview } from "./footer-preview";

interface EmailEditorSandboxProps {
  template?: {
    id?: string;
    title?: string;
    preview_text?: string;
    content?: string;
  };
  showSaveButton?: boolean;
  autofocus?: FocusPosition;
  onSave?: (data: {
    title: string;
    previewText: string;
    content: string;
  }) => Promise<void>;
  onUpdate?: (data: {
    title: string;
    previewText: string;
    content: string;
  }) => Promise<void>;
  onSendTest?: (data: {
    subject: string;
    previewText: string;
    from: string;
    to: string;
    replyTo: string;
    content: string;
  }) => Promise<void>;
  fanCount?: number;
  setEditor?: (editor: Editor | null) => void;
  subscriptionPlan?: SubscriptionPlan;
}

export function EmailEditorSandbox(props: EmailEditorSandboxProps) {
  const {
    template,
    showSaveButton = true,
    autofocus,
    onSave,
    onUpdate,
    onSendTest,
    fanCount = 0,
    setEditor: setParentEditor,
    subscriptionPlan = "starter",
  } = props;

  const [subject, setSubject] = useState(template?.title || "");
  const [previewText, setPreviewText] = useState(template?.preview_text || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showReplyTo, setShowReplyTo] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [editor, setEditorState] = useState<Editor | null>(null);

  // Function to set both local and parent editor state
  const setEditor = (newEditor: Editor | null) => {
    setEditorState(newEditor);
    if (setParentEditor) {
      setParentEditor(newEditor);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSaveTemplate = async () => {
    if (!onSave) return;

    const json = editor?.getJSON();
    const trimmedSubject = subject.trim();
    const trimmedPreviewText = previewText.trim();

    if (!trimmedSubject || !json) {
      toast.error("Subject, Preview Text and Content are required");
      return;
    }

    if (trimmedSubject.length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: trimmedSubject,
        previewText: trimmedPreviewText,
        content: JSON.stringify(json),
      });

      toast.success("Campaign saved as draft");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save campaign"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!onUpdate) return;

    const json = editor?.getJSON();
    const trimmedSubject = subject.trim();
    const trimmedPreviewText = previewText.trim();

    if (!trimmedSubject || !json) {
      toast.error("Subject, Preview Text and Content are required");
      return;
    }

    if (trimmedSubject.length < 3) {
      toast.error("Subject must be at least 3 characters");
      return;
    }

    setIsUpdating(true);

    try {
      await onUpdate({
        title: trimmedSubject,
        previewText: trimmedPreviewText,
        content: JSON.stringify(json),
      });

      toast.success("Campaign sent successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send campaign"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!onSendTest) return;

    const json = editor?.getJSON();

    if (!json) {
      toast.error("Editor content is empty");
      return;
    }

    if (!to) {
      toast.error("Test recipient email is required");
      return;
    }

    setIsSendingTest(true);

    try {
      await onSendTest({
        subject,
        previewText,
        from,
        to,
        replyTo,
        content: JSON.stringify(json),
      });

      toast.success("Test Email has been sent");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send test email"
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <>
      <div className="max-w-[calc(600px+80px)] mx-auto flex items-center justify-between gap-1.5 px-10 pt-5">
        <div className="flex items-center gap-1.5">
          <PreviewEmailDialog
            subject={subject}
            previewText={previewText}
            editor={editor}
            subscriptionPlan={subscriptionPlan}
          />

          <CopyEmailHtml
            previewText={previewText}
            editor={editor}
            subscriptionPlan={subscriptionPlan}
          />

          <button
            className="flex items-center rounded-md bg-white px-2 py-1 text-sm text-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={isSendingTest || !onSendTest}
            onClick={handleSendTestEmail}
          >
            {isSendingTest ? (
              <Loader2Icon className="mr-1 inline-block size-4 animate-spin" />
            ) : (
              <AsteriskIcon className="mr-1 inline-block size-4" />
            )}
            Send Test
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showSaveButton && onSave && (
            <button
              className={cn(
                "flex items-center justify-center rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={isSaving}
              onClick={handleSaveTemplate}
            >
              {isSaving ? (
                <Loader2Icon className="mr-1 inline-block size-4 animate-spin" />
              ) : (
                <SaveIcon className="mr-1 inline-block size-4" />
              )}
              <span>Save Draft</span>
            </button>
          )}

          {onUpdate && (
            <button
              className={cn(
                "flex items-center justify-center rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={isUpdating}
              onClick={handleUpdateTemplate}
            >
              {isUpdating ? (
                <Loader2Icon className="mr-1 inline-block size-4 animate-spin" />
              ) : (
                <SendIcon className="mr-1 inline-block size-4" />
              )}
              <span>Send Campaign</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[calc(600px+80px)] mx-auto px-10">
        {subscriptionPlan === "starter" && (
          <div className="mb-4">
            <FooterPreview subscriptionPlan={subscriptionPlan} />
          </div>
        )}

        <Label className="flex items-center font-normal">
          <span className="w-20 shrink-0 font-normal text-gray-600 after:ml-0.5 after:text-red-400 after:content-['*']">
            Subject
          </span>
          <Input
            className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Email Subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </Label>

        <div className="flex items-center gap-1.5">
          <Label className="flex grow items-center font-normal">
            <span className="w-20 shrink-0 font-normal text-gray-600">
              From
            </span>
            <Input
              className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Your Name <your@email.com>"
              type="text"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </Label>

          {!showReplyTo && (
            <button
              className="inline-block h-full shrink-0 bg-transparent px-1 text-sm text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              type="button"
              onClick={() => {
                setShowReplyTo(true);
              }}
            >
              Reply-To
            </button>
          )}
        </div>

        {showReplyTo && (
          <Label className="flex items-center font-normal">
            <span className="w-20 shrink-0 font-normal text-gray-600">
              Reply-To
            </span>
            <div className="align-content-stretch flex grow items-center">
              <Input
                className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="reply@email.com"
                type="text"
                value={replyTo}
                onChange={(event) => setReplyTo(event.target.value)}
              />
              <button
                className="flex h-10 shrink-0 items-center bg-transparent px-1 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={() => {
                  setReplyTo("");
                  setShowReplyTo(false);
                }}
              >
                <XIcon className="inline-block size-4" />
              </button>
            </div>
          </Label>
        )}

        <div className="flex items-center">
          <Label className="flex items-center font-normal">
            <span className="w-20 shrink-0 font-normal text-gray-600">To</span>
            <div className="flex items-center">
              <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                <UsersIcon className="mr-1 h-3 w-3" />
                All Subscribers ({fanCount.toLocaleString()})
              </Badge>
              <Input
                className="h-auto rounded-none border-none py-2.5 font-normal focus-visible:ring-0 focus-visible:ring-offset-0 w-64"
                placeholder="Test recipient email"
                type="text"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>
          </Label>
        </div>

        <div className="relative my-6">
          <Input
            className="h-auto rounded-none border-x-0 border-gray-300 px-0 py-2.5 pr-5 text-base focus-visible:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Preview Text"
            type="text"
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
          />
          <span className="absolute right-0 top-0 flex h-full items-center">
            <PreviewTextInfo />
          </span>
        </div>
      </div>

      {template?.id ? (
        <DirectTemplateEditor
          templateId={template.id}
          setEditor={setEditor}
          autofocus={autofocus}
        />
      ) : (
        <EmailEditor
          defaultContent={template?.content || JSON.stringify(defaultEmailJSON)}
          setEditor={setEditor}
          autofocus={autofocus}
        />
      )}
    </>
  );
}
