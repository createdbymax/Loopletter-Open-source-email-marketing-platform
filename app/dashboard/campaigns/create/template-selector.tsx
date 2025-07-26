"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Music,
  Mic,
  ShoppingBag,
  FileText,
  ArrowRight,
  Mail,
  Image,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { emailTemplates } from "@/lib/email-templates";
import { TemplateContentPreview } from "@/components/email-builder/template-content-preview";
import { SpotifyTemplateGenerator } from "@/components/spotify-template-generator";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  preview?: string;
}

// Map the email templates to the format needed for the template selector
const templates: Template[] = [
  {
    id: "blank",
    name: "Blank Template",
    description: "Start with a clean slate and design your email from scratch",
    category: "Basic",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: "music-release",
    name: "Music Release",
    description:
      "Announce your new single, EP, or album with streaming links and artwork",
    category: "Music",
    icon: <Music className="w-6 h-6" />,
  },
  {
    id: "show-announcement",
    name: "Show Announcement",
    description:
      "Promote your upcoming concerts and live performances with venue details",
    category: "Events",
    icon: <Mic className="w-6 h-6" />,
  },
  {
    id: "merchandise",
    name: "Merchandise",
    description:
      "Showcase your latest merch drops with product images and pricing",
    category: "Commerce",
    icon: <ShoppingBag className="w-6 h-6" />,
  },
  {
    id: "newsletter",
    name: "Artist Newsletter",
    description: "Keep your fans updated with news, tour dates, and more",
    category: "Updates",
    icon: <Mail className="w-6 h-6" />,
  },
  {
    id: "artist-promo",
    name: "Artist Promo",
    description:
      "Promote your artist with a visually striking, image-focused email",
    category: "Promo",
    icon: <Image className="w-6 h-6" />,
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string, templateData?: any) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [, setHoveredTemplate] = useState<string | null>(null);
  const [showSpotifyGenerator, setShowSpotifyGenerator] = useState(false);

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
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
              <h1 className="text-xl font-semibold">Choose a Template</h1>
              <p className="text-sm text-gray-600">
                Start with a professional template or build from scratch
              </p>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Template Categories */}
        <div className="mb-8">
          <div className="flex gap-2 mb-6">
            <Badge variant="secondary">All Templates</Badge>
            <Badge variant="outline">Basic</Badge>
            <Badge variant="outline">Music</Badge>
            <Badge variant="outline">Events</Badge>
            <Badge variant="outline">Commerce</Badge>
            <Badge variant="outline">Updates</Badge>
            <Badge variant="outline">Promo</Badge>
          </div>
        </div>

        {/* Spotify Generator Card */}
        <div className="mb-8">
          <Card
            className="border-2 border-dashed border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setShowSpotifyGenerator(true)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Generate from Spotify
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      NEW
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Paste a Spotify link to instantly create a professional
                    email ready to send
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Music className="w-4 h-4" />
                <span>Works with tracks and albums</span>
                <span>•</span>
                <span>Includes streaming links</span>
                <span>•</span>
                <span>Auto-extracts artwork</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        template.category === "Music"
                          ? "bg-purple-100 text-purple-600"
                          : template.category === "Events"
                            ? "bg-red-100 text-red-600"
                            : template.category === "Commerce"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
                </CardDescription>

                {/* Template Preview */}
                <div className="rounded-lg overflow-hidden min-h-[200px]">
                  <TemplateContentPreview
                    templateId={template.id}
                    height={200}
                  />
                </div>

                {/* Template Features */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Features:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Ready to Use
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Fully Customizable
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Mobile Responsive
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Template Preview */}
              <div className="w-full md:w-1/2 lg:w-2/5">
                <div className="rounded-lg overflow-hidden border border-gray-200 h-[400px]">
                  <TemplateContentPreview
                    templateId={selectedTemplate}
                    height={400}
                  />
                </div>
              </div>

              {/* Template Details */}
              <div className="w-full md:w-1/2 lg:w-3/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {templates.find((t) => t.id === selectedTemplate)?.name}
                    </h3>
                    <p className="text-gray-600">
                      {
                        templates.find((t) => t.id === selectedTemplate)
                          ?.description
                      }
                    </p>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className="flex items-center gap-2"
                  >
                    Use This Template
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    This template includes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-sm">
                      Pre-designed Layout
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Sample Content
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Responsive Design
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Easy Customization
                    </Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Perfect for:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate === "blank" &&
                      "Creating custom emails from scratch with complete design freedom."}
                    {selectedTemplate === "music-release" &&
                      "Announcing new singles, EPs, or albums with streaming links and artwork."}
                    {selectedTemplate === "show-announcement" &&
                      "Promoting upcoming concerts and live performances with venue details and ticket links."}
                    {selectedTemplate === "merchandise" &&
                      "Showcasing your latest merch drops with product images, descriptions, and pricing."}
                    {selectedTemplate === "newsletter" &&
                      "Keeping your fans updated with news, tour dates, releases, and more in a comprehensive format."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spotify Template Generator Dialog */}
      <Dialog
        open={showSpotifyGenerator}
        onOpenChange={setShowSpotifyGenerator}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Template from Spotify</DialogTitle>
          </DialogHeader>
          <SpotifyTemplateGenerator
            onTemplateGenerated={(data) => {
              // When a template is generated from Spotify, pass it to the campaign builder
              console.log("Template Selector - Spotify data received:", data);
              onSelectTemplate("spotify-generated", data);
              setShowSpotifyGenerator(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
