"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Send,
  Eye,
  Save,
  Plus,
  Type,
  Image as ImageIcon,
  Link,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getOrCreateArtistByClerkId, getFansByArtist } from "@/lib/db";
import { TemplateSelector } from "./template-selector";
import { TemplateForm } from "./template-forms";
import { TemplatePreview } from "@/components/ui/template-preview";
import { TemplateEditor } from "./template-editor";
import { MailyEditor } from "@/components/email-builder/maily-editor";
import { DomainCheck } from "./domain-check";
import { EmailLimitWarning } from "@/components/ui/limit-warning";
import { hasReachedEmailSendLimit, getUserSubscriptionPlan } from "@/lib/subscription";

interface Block {
  id: string;
  type: "text" | "heading" | "image" | "button" | "divider";
  content: string;
  styles?: {
    fontSize?: number;
    fontWeight?: string;
    textAlign?: "left" | "center" | "right";
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
  href?: string;
}

export function CampaignBuilder() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Domain validation state
  const [isDomainValid, setIsDomainValid] = useState(false);

  // Campaign builder flow state
  const [currentStep, setCurrentStep] = useState<
    | "template"
    | "form"
    | "maily-editor"
  >("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<unknown>(null);
  const [fanCount, setFanCount] = useState(0);
  const [emailHtml, setEmailHtml] = useState<string>("");

  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "1",
      type: "heading",
      content: "Welcome to our newsletter",
      styles: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
    },
    {
      id: "2",
      type: "text",
      content: "Start writing your email content here...",
      styles: { fontSize: 16 },
    },
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("2");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [showPreview, setShowPreview] = useState(false);

  // Email metadata
  const [emailData, setEmailData] = useState({
    subject: "",
    from: "",
    previewText: "",
    audience: "all-subscribers",
  });

  // Campaign settings
  const [campaignSettings, setCampaignSettings] = useState({
    track_opens: true,
    track_clicks: true,
    send_time_optimization: false,
    auto_tweet: false,
    send_to_unsubscribed: false,
  });

  // Artist state
  const [artist, setArtist] = useState(null);

  // Fetch fan count and artist on component mount
  useEffect(() => {
    async function fetchData() {
      if (!user || !isLoaded) return;
      try {
        const artistData = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(artistData);
        const fans = await getFansByArtist(artistData.id);
        setFanCount(fans.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [user, isLoaded]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Always go directly to the Maily editor with the selected template
    setCurrentStep("maily-editor");
    setPreferredEditor("maily-editor");
    
    // Clear any existing email HTML to ensure we use the template
    setEmailHtml('');
    
    console.log(`Selected template: ${templateId}`);
  };

  // Handle template form completion
  const handleTemplateFormComplete = (data: unknown) => {
    setTemplateData(data);
    // Always go to Maily editor after form completion
    setCurrentStep("maily-editor");

    // Pre-populate email metadata based on template
    if (selectedTemplate === "music-release") {
      setEmailData((prev) => ({
        ...prev,
        subject: `🎵 ${data.artistName} just released "${data.releaseTitle}"!`,
        previewText: `New ${data.releaseType} from ${data.artistName} - listen now!`,
      }));
    } else if (selectedTemplate === "show-announcement") {
      setEmailData((prev) => ({
        ...prev,
        subject: `🎤 ${data.artistName} live in ${data.city} - ${data.date}`,
        previewText: `Don't miss ${data.artistName} at ${data.venue}!`,
      }));
    } else if (selectedTemplate === "merchandise") {
      setEmailData((prev) => ({
        ...prev,
        subject: `🛍️ New ${data.artistName} merch is here!`,
        previewText: `Check out the ${data.collectionName} collection`,
      }));
    }
  };

  // Save campaign as draft
  const handleSaveDraft = async () => {
    try {
      const campaignData = {
        title: emailData.subject || "Untitled Campaign",
        subject: emailData.subject || "Untitled Campaign",
        message:
          selectedTemplate === "visual-builder"
            ? emailHtml
            : selectedTemplate
              ? ""
              : blocks.map((b) => b.content).join("\n"),
        templateId: selectedTemplate,
        templateData: templateData,
        settings: campaignSettings,
        status: "draft",
      };

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        alert("Campaign saved as draft!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(`Failed to save campaign: ${error.message}`);
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!emailData.subject) {
      alert("Please add a subject line before sending");
      return;
    }

    if (
      confirm("Are you sure you want to send this campaign to all subscribers?")
    ) {
      try {
        // First save the campaign
        const campaignData = {
          title: emailData.subject,
          subject: emailData.subject,
          message:
            selectedTemplate === "visual-builder"
              ? emailHtml
              : selectedTemplate
                ? ""
                : blocks.map((b) => b.content).join("\n"),
          templateId: selectedTemplate,
          templateData: templateData,
          settings: campaignSettings,
          status: "sent",
        };

        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campaignData),
        });

        if (response.ok) {
          const campaign = await response.json();

          // Then send it
          const sendResponse = await fetch(
            `/api/campaigns/${campaign.id}/send`,
            {
              method: "POST",
            }
          );

          if (sendResponse.ok) {
            const result = await sendResponse.json();
            alert(
              `Campaign sent successfully to ${result.sentCount} subscribers!`
            );
            router.push("/dashboard/campaigns");
          } else {
            const errorData = await sendResponse.json();
            throw new Error(errorData.error || "Failed to send campaign");
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create campaign");
        }
      } catch (error) {
        console.error("Error sending campaign:", error);
        alert(`Failed to send campaign: ${error.message}`);
      }
    }
  };

  // Show template selector
  if (currentStep === "template") {
    return <TemplateSelector onSelectTemplate={handleTemplateSelect} />;
  }

  // Show template form
  if (currentStep === "form" && selectedTemplate) {
    return (
      <TemplateForm
        templateId={selectedTemplate}
        onBack={() => setCurrentStep("template")}
        onContinue={handleTemplateFormComplete}
      />
    );
  }

  // We've removed the visual-editor and tiptap-editor conditions as we're only using the Maily editor now

  // Show Maily email designer
  if (currentStep === "maily-editor") {
    return (
      <MailyEditor
        onBack={() => setCurrentStep("template")}
        onSave={(htmlContent) => {
          setEmailHtml(htmlContent);
          // Update email data with a default subject if not set
          if (!emailData.subject) {
            setEmailData((prev) => ({
              ...prev,
              subject: "My Email Campaign",
            }));
          }
          handleSaveDraft();
        }}
        onSend={(htmlContent) => {
          setEmailHtml(htmlContent);
          // Update email data with a default subject if not set
          if (!emailData.subject) {
            setEmailData((prev) => ({
              ...prev,
              subject: "My Email Campaign",
            }));
          }
          handleSendCampaign();
        }}
        initialHtml={emailHtml}
        templateData={templateData}
        templateId={selectedTemplate}
        fanCount={fanCount}
        subscriptionPlan={artist ? getUserSubscriptionPlan(artist) : 'starter'}
      />
    );
  }

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
    const insertIndex = selectedIndex >= 0 ? selectedIndex + 1 : blocks.length;

    const newBlocks = [...blocks];
    newBlocks.splice(insertIndex, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(blocks[0]?.id || null);
    }
  };

  const getDefaultContent = (type: Block["type"]): string => {
    switch (type) {
      case "heading":
        return "New heading";
      case "text":
        return "Start typing...";
      case "image":
        return "";
      case "button":
        return "Click here";
      case "divider":
        return "";
      default:
        return "";
    }
  };

  const getDefaultStyles = (type: Block["type"]) => {
    switch (type) {
      case "heading":
        return { fontSize: 20, fontWeight: "bold" };
      case "text":
        return { fontSize: 16 };
      case "button":
        return {
          backgroundColor: "#2563eb",
          color: "#ffffff",
          padding: "12px 24px",
          textAlign: "center" as const,
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Create Campaign</h1>
              <p className="text-sm text-gray-600">
                Design your email campaign
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={!isDomainValid}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSendCampaign}
              disabled={
                !isDomainValid ||
                (artist && hasReachedEmailSendLimit(artist, fanCount))
              }
              title={
                artist && hasReachedEmailSendLimit(artist, fanCount)
                  ? "You've reached your email sending limit"
                  : ""
              }
            >
              <Send className="w-4 h-4 mr-2" />
              Send Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Domain Validation Check */}
        <div className="mb-6">
          <DomainCheck onValidationComplete={setIsDomainValid} />
        </div>

        {/* Email Limit Warning */}
        {user && (
          <div className="mb-6">
            <EmailLimitWarning
              artist={artist}
              currentCount={fanCount} // Using fan count as a proxy for email sends
            />
          </div>
        )}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Email Settings */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-4">Email Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Enter subject line..."
                  />
                </div>

                <div>
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    value={emailData.from}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    placeholder="your-name@domain.com"
                  />
                </div>

                <div>
                  <Label htmlFor="preview">Preview Text</Label>
                  <Input
                    id="preview"
                    value={emailData.previewText}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        previewText: e.target.value,
                      }))
                    }
                    placeholder="This appears in inbox preview..."
                  />
                </div>

                <div>
                  <Label>Audience</Label>
                  <div className="mt-2">
                    <Badge variant="secondary">
                      All Subscribers ({fanCount.toLocaleString()})
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-medium mb-4">Campaign Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Email Opens
                    </Label>
                    <p className="text-xs text-gray-600">
                      Know when recipients open your emails
                    </p>
                  </div>
                  <Switch
                    checked={campaignSettings.track_opens}
                    onCheckedChange={(checked) =>
                      setCampaignSettings((prev) => ({
                        ...prev,
                        track_opens: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Track Link Clicks
                    </Label>
                    <p className="text-xs text-gray-600">
                      Track which links recipients click
                    </p>
                  </div>
                  <Switch
                    checked={campaignSettings.track_clicks}
                    onCheckedChange={(checked) =>
                      setCampaignSettings((prev) => ({
                        ...prev,
                        track_clicks: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Send Time Optimization
                    </Label>
                    <p className="text-xs text-gray-600">
                      Send at optimal times for each recipient
                    </p>
                  </div>
                  <Switch
                    checked={campaignSettings.send_time_optimization}
                    onCheckedChange={(checked) =>
                      setCampaignSettings((prev) => ({
                        ...prev,
                        send_time_optimization: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Block Library - Only show for block editor */}
            {!selectedTemplate && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-medium mb-4">Add Content</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock("text")}
                    className="flex flex-col h-16 gap-1"
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-xs">Text</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock("heading")}
                    className="flex flex-col h-16 gap-1"
                  >
                    <Type className="w-4 h-4 font-bold" />
                    <span className="text-xs">Heading</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock("image")}
                    className="flex flex-col h-16 gap-1"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">Image</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock("button")}
                    className="flex flex-col h-16 gap-1"
                  >
                    <Link className="w-4 h-4" />
                    <span className="text-xs">Button</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Main Editor */}
          <div className="col-span-6">
            <div className="bg-white rounded-lg border">
              {/* Editor Toolbar */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="sm">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="sm">
                      <Palette className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Canvas */}
              <div className="p-6">
                <div
                  className={`mx-auto ${
                    previewMode === "mobile" ? "max-w-sm" : "max-w-2xl"
                  }`}
                >
                  {selectedTemplate && templateData ? (
                    // Show template preview
                    <TemplatePreview
                      templateId={selectedTemplate}
                      templateData={templateData}
                    />
                  ) : (
                    // Show block editor
                    <div className="bg-white border rounded-lg shadow-sm">
                      <div className="p-6 space-y-4">
                        {blocks.map((block) => (
                          <BlockEditor
                            key={block.id}
                            block={block}
                            isSelected={selectedBlockId === block.id}
                            onSelect={() => setSelectedBlockId(block.id)}
                            onUpdate={(updates) =>
                              updateBlock(block.id, updates)
                            }
                            onDelete={() => deleteBlock(block.id)}
                          />
                        ))}

                        {/* Add Block Button */}
                        <Button
                          variant="ghost"
                          className="w-full border-2 border-dashed border-gray-300 h-12 text-gray-500 hover:border-gray-400"
                          onClick={() => addBlock("text")}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add content block
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Template/Block Properties */}
          <div className="col-span-3">
            {selectedTemplate && templateData ? (
              <TemplateEditor
                templateId={selectedTemplate}
                templateData={templateData}
                onUpdate={setTemplateData}
              />
            ) : (
              selectedBlockId && (
                <BlockProperties
                  block={blocks.find((b) => b.id === selectedBlockId)!}
                  onUpdate={(updates) => updateBlock(selectedBlockId, updates)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

function BlockEditor({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: BlockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    onSelect();
    if (block.type === "text" || block.type === "heading") {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && block.type === "heading") {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const blockStyles = {
    fontSize: block.styles?.fontSize || 16,
    fontWeight: block.styles?.fontWeight || "normal",
    textAlign: block.styles?.textAlign || "left",
    color: block.styles?.color || "#000000",
    backgroundColor: block.styles?.backgroundColor || "transparent",
    padding: block.styles?.padding || "0",
    margin: block.styles?.margin || "0",
  };

  return (
    <div
      className={`relative group cursor-pointer rounded-md transition-all ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "hover:bg-gray-50"
      }`}
      onClick={handleClick}
    >
      {/* Delete button */}
      {isSelected && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </Button>
      )}

      {block.type === "text" &&
        (isEditing ? (
          <textarea
            ref={inputRef}
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={blockStyles}
            className="w-full bg-transparent border-none outline-none resize-none"
            rows={3}
          />
        ) : (
          <div
            style={blockStyles}
            className="min-h-[1.5em] whitespace-pre-wrap"
          >
            {block.content || "Click to edit text..."}
          </div>
        ))}

      {block.type === "heading" &&
        (isEditing ? (
          <input
            ref={inputRef as unknown}
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={blockStyles}
            className="w-full bg-transparent border-none outline-none"
          />
        ) : (
          <h2 style={blockStyles} className="min-h-[1.2em]">
            {block.content || "Click to edit heading..."}
          </h2>
        ))}

      {block.type === "image" && (
        <div className="space-y-2">
          <Input
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Enter image URL..."
            className="text-sm"
          />
          {block.content && (
            <img
              src={block.content}
              alt=""
              className="max-w-full h-auto rounded"
              style={blockStyles}
            />
          )}
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <Input
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Button text..."
            className="text-sm"
          />
          <Input
            value={block.href || ""}
            onChange={(e) => onUpdate({ href: e.target.value })}
            placeholder="Button link (https://...)..."
            className="text-sm"
          />
          <button
            style={blockStyles}
            className="px-6 py-3 rounded-md font-medium"
          >
            {block.content || "Button"}
          </button>
        </div>
      )}

      {block.type === "divider" && (
        <hr className="border-gray-300 my-4" style={blockStyles} />
      )}
    </div>
  );
}

interface BlockPropertiesProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}

function BlockProperties({ block, onUpdate }: BlockPropertiesProps) {
  const updateStyle = (key: string, value: unknown) => {
    onUpdate({
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Block Properties</h3>

      <div className="space-y-3">
        <div>
          <Label>Font Size</Label>
          <Input
            type="number"
            value={block.styles?.fontSize || 16}
            onChange={(e) => updateStyle("fontSize", parseInt(e.target.value))}
            min="8"
            max="72"
          />
        </div>

        <div>
          <Label>Text Color</Label>
          <Input
            type="color"
            value={block.styles?.color || "#000000"}
            onChange={(e) => updateStyle("color", e.target.value)}
          />
        </div>

        {block.type === "button" && (
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={block.styles?.backgroundColor || "#2563eb"}
              onChange={(e) => updateStyle("backgroundColor", e.target.value)}
            />
          </div>
        )}

        <div>
          <Label>Text Alignment</Label>
          <div className="flex gap-1 mt-1">
            {["left", "center", "right"].map((align) => (
              <Button
                key={align}
                variant={
                  block.styles?.textAlign === align ? "default" : "outline"
                }
                size="sm"
                onClick={() => updateStyle("textAlign", align)}
                className="flex-1"
              >
                {align}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
