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
import { Artist } from "@/lib/types";
import { TemplateSelector } from "./template-selector";
import { TemplateForm } from "./template-forms";
import { TemplatePreview } from "@/components/ui/template-preview";
import { TemplateEditor } from "./template-editor";
import { MailyEditor } from "@/components/email-builder/maily-editor";
import { DomainCheck } from "./domain-check";
import { EmailLimitWarning } from "@/components/ui/limit-warning";
import { CampaignSendingModal } from "@/components/email-builder/campaign-sending-modal";
import {
  hasReachedEmailSendLimit,
  getUserSubscriptionPlan,
} from "@/lib/subscription";

// Template data types
interface MusicReleaseData {
  artistName: string;
  releaseTitle: string;
  releaseType: string;
}

interface ShowAnnouncementData {
  artistName: string;
  city: string;
  date: string;
  venue: string;
}

interface MerchandiseData {
  artistName: string;
  collectionName: string;
}

type TemplateData =
  | MusicReleaseData
  | ShowAnnouncementData
  | MerchandiseData
  | Record<string, unknown>;

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
    "template" | "form" | "maily-editor"
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
    fromName: "",
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
  const [artist, setArtist] = useState<Artist | null>(null);

  // Sending modal state
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [campaignToSend, setCampaignToSend] = useState<string | null>(null);

  // Handle sending completion
  const handleSendingComplete = (result: any) => {
    console.log("Campaign sending completed:", result);
    // Redirect to campaigns list after successful send
    if (result.success) {
      router.push("/dashboard/campaigns");
    }
  };

  const handleCloseSendingModal = () => {
    setShowSendingModal(false);
    setCampaignToSend(null);
  };

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
        const subscribedFans = fans.filter(fan => fan.status === 'subscribed');
        setFanCount(subscribedFans.length);

        // Set default values if not already set
        setEmailData((prev) => ({
          ...prev,
          fromName:
            prev.fromName ||
            artistData.default_from_name ||
            artistData.name ||
            "",
          subject: prev.subject || "My Email Campaign",
          previewText: prev.previewText || "",
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [user, isLoaded]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string, templateData?: any) => {
    setSelectedTemplate(templateId);

    // If it's a Spotify-generated template, set the Maily JSON content
    if (templateId === "spotify-generated" && templateData) {
      console.log(
        "Campaign Builder - Received Spotify template data:",
        templateData
      );

      // Store the Maily JSON as the template data
      setTemplateData(templateData);

      // Pre-populate email metadata based on Spotify data
      setEmailData((prev) => ({
        ...prev,
        subject: `🎵 New ${templateData.releaseData.type === "track" ? "Track" : "Album"}: ${templateData.releaseData.title}`,
        previewText: `${templateData.releaseData.artist} just released "${templateData.releaseData.title}" - listen now!`,
      }));

      console.log("Campaign Builder - Template data set:", templateData);
    } else {
      // Clear any existing email HTML to ensure we use the template
      setEmailHtml("");
    }

    // Always go directly to the Maily editor with the selected template
    setCurrentStep("maily-editor");

    console.log(`Selected template: ${templateId}`);
  };

  // Handle template form completion
  const handleTemplateFormComplete = (data: TemplateData) => {
    setTemplateData(data);
    // Always go to Maily editor after form completion
    setCurrentStep("maily-editor");

    // Pre-populate email metadata based on template
    if (
      selectedTemplate === "music-release" &&
      "artistName" in data &&
      "releaseTitle" in data &&
      "releaseType" in data
    ) {
      const musicData = data as MusicReleaseData;
      setEmailData((prev) => ({
        ...prev,
        subject: `🎵 ${musicData.artistName} just released "${musicData.releaseTitle}"!`,
        previewText: `New ${musicData.releaseType} from ${musicData.artistName} - listen now!`,
      }));
    } else if (
      selectedTemplate === "show-announcement" &&
      "artistName" in data &&
      "city" in data &&
      "date" in data &&
      "venue" in data
    ) {
      const showData = data as ShowAnnouncementData;
      setEmailData((prev) => ({
        ...prev,
        subject: `🎤 ${showData.artistName} live in ${showData.city} - ${showData.date}`,
        previewText: `Don't miss ${showData.artistName} at ${showData.venue}!`,
      }));
    } else if (
      selectedTemplate === "merchandise" &&
      "artistName" in data &&
      "collectionName" in data
    ) {
      const merchData = data as MerchandiseData;
      setEmailData((prev) => ({
        ...prev,
        subject: `🛍️ New ${merchData.artistName} merch is here!`,
        previewText: `Check out the ${merchData.collectionName} collection`,
      }));
    }
  };

  // Save campaign as draft
  const handleSaveDraft = async () => {
    try {
      // Ensure we have at least basic content for the draft
      const draftTitle = emailData.subject || "Untitled Campaign";
      const draftSubject = emailData.subject || "Draft Campaign";
      const draftMessage = selectedTemplate === "visual-builder"
        ? emailHtml || "Draft email content"
        : selectedTemplate
          ? "Template-based email content"
          : blocks.map((b) => b.content).join("\n") || "Draft email content";

      const campaignData = {
        title: draftTitle,
        subject: draftSubject,
        from_name:
          emailData.fromName || artist?.default_from_name || artist?.name || "Artist",
        from_email: artist?.ses_domain ? `${artist.default_from_email || "noreply"}@${artist.ses_domain}` : null,
        message: draftMessage,
        template_id: selectedTemplate,
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
        const result = await response.json();
        console.log('Campaign saved successfully:', result);
        alert("Campaign saved as draft!");
      } else {
        const errorData = await response.json();
        console.error('Campaign save failed:', errorData);
        throw new Error(errorData.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(
        `Failed to save campaign: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    console.log('handleSendCampaign called with emailHtml length:', emailHtml.length);
    console.log('emailData:', emailData);
    
    if (!emailData.subject) {
      alert("Please add a subject line before sending");
      return;
    }

    if (!emailHtml || emailHtml.trim().length === 0) {
      alert("Please add content to your email before sending");
      return;
    }

    try {
      // First create the campaign
      const campaignData = {
        title: emailData.subject,
        subject: emailData.subject,
        from_name:
          emailData.fromName || artist?.default_from_name || artist?.name,
        from_email: artist?.ses_domain
          ? `${artist.default_from_email || "noreply"}@${artist.ses_domain}`
          : null,
        message: emailHtml, // Use the actual HTML content from the editor
        template_id: selectedTemplate,
        templateData: templateData,
        settings: campaignSettings,
        status: "draft", // Create as draft first, then send
      };

      console.log('Creating campaign with data:', {
        ...campaignData,
        message: campaignData.message ? `${campaignData.message.substring(0, 100)}...` : 'No message',
        templateData: campaignData.templateData ? 'Has template data' : 'No template data'
      });

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        const result = await response.json();
        const campaign = result.campaign;
        
        console.log('Campaign created successfully:', campaign);

        // Now immediately send the campaign and show the sending modal
        console.log('Setting campaign to send:', campaign.id);
        setCampaignToSend(campaign.id);
        console.log('Setting show sending modal to true');
        setShowSendingModal(true);
        
        console.log('Modal state - campaignToSend:', campaign.id, 'showSendingModal:', true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert(
        `Failed to create campaign: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Show template selector
  if (currentStep === "template") {
    return <TemplateSelector onSelectTemplate={handleTemplateSelect} />;
  }

  // Show template form
  if (currentStep === "form") {
    if (!selectedTemplate) {
      // If no template selected, go back to template selection
      setCurrentStep("template");
      return null;
    }
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
      <>
        <MailyEditor
          initialHtml={emailHtml}
          templateId={selectedTemplate || undefined}
          templateData={templateData}
          fanCount={fanCount}
          subscriptionPlan={artist ? getUserSubscriptionPlan(artist) : "starter"}
          subject={emailData.subject}
          previewText={emailData.previewText}
          fromName={emailData.fromName}
          artist={artist}
          onBack={() => setCurrentStep("template")}
          onSave={(htmlContent: string) => {
            console.log('Campaign builder - onSave called with content length:', htmlContent.length);
            setEmailHtml(htmlContent);
            handleSaveDraft();
          }}
          onSend={(data: { subject: string; previewText: string; content: string }) => {
            console.log('Campaign builder - onSend called with:', {
              subject: data.subject,
              previewText: data.previewText,
              contentLength: data.content.length
            });
            
            // Update email data with the data from the editor
            setEmailData((prev) => ({
              ...prev,
              subject: data.subject || prev.subject || "My Email Campaign",
              previewText: data.previewText || prev.previewText
            }));
            
            setEmailHtml(data.content);
            handleSendCampaign();
          }}
        />
        
        {/* Campaign Sending Modal - needs to be here for Maily editor */}
        {campaignToSend && (
          <CampaignSendingModal
            isOpen={showSendingModal}
            onClose={handleCloseSendingModal}
            campaignId={campaignToSend}
            fanCount={fanCount}
            onComplete={handleSendingComplete}
          />
        )}
      </>
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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Create Campaign
              </h1>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
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
                Boolean(artist && hasReachedEmailSendLimit(artist, fanCount))
              }
              title={
                artist && hasReachedEmailSendLimit(artist, fanCount)
                  ? "You've reached your email sending limit"
                  : ""
              }
            >
              <Send className="w-4 h-4 mr-2" />
              Create Campaign
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
            {artist && (
              <EmailLimitWarning
                artist={artist}
                currentCount={fanCount} // Using fan count as a proxy for email sends
              />
            )}
          </div>
        )}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Email Settings */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4">
              <h3 className="font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                Email Settings
              </h3>
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
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailData.fromName}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        fromName: e.target.value,
                      }))
                    }
                    placeholder={`${artist?.name || "Your Name"}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How you'll appear in subscribers' inboxes (e.g., "Sarah from
                    The Band")
                  </p>
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
                      Subscribed Fans ({fanCount.toLocaleString()})
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Settings */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4">
              <h3 className="font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                Campaign Settings
              </h3>
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
              <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-4">
                <h3 className="font-medium mb-4 text-neutral-900 dark:text-neutral-100">
                  Add Content
                </h3>
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
            <div className="bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
              {/* Editor Toolbar */}
              <div className="border-b dark:border-neutral-700 p-4">
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
                  {selectedTemplate &&
                  templateData &&
                  Object.keys(templateData).length > 0 ? (
                    // Show template preview
                    <TemplatePreview
                      templateId={selectedTemplate}
                      templateData={templateData as any}
                    />
                  ) : (
                    // Show block editor
                    <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-700 rounded-lg shadow-sm">
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
                          className="w-full border-2 border-dashed border-gray-300 dark:border-neutral-600 h-12 text-gray-500 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-neutral-500"
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

      {/* Campaign Sending Modal */}
      {campaignToSend && (
        <CampaignSendingModal
          isOpen={showSendingModal}
          onClose={handleCloseSendingModal}
          campaignId={campaignToSend}
          fanCount={fanCount}
          onComplete={handleSendingComplete}
        />
      )}
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
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-2"
          : "hover:bg-gray-50 dark:hover:bg-neutral-800"
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
            ref={inputRef as unknown as React.RefObject<HTMLInputElement>}
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
