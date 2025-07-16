"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Mic, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  preview: string;
  fields: string[];
}

const templates: Template[] = [
  {
    id: 'music-release',
    name: 'Music Release',
    description: 'Perfect for announcing new singles, EPs, or albums with streaming links and artwork',
    category: 'Music',
    icon: <Music className="w-6 h-6" />,
    preview: '/api/template-preview/music-release',
    fields: ['Artist Name', 'Release Title', 'Release Type', 'Artwork', 'Streaming Links', 'Description']
  },
  {
    id: 'show-announcement',
    name: 'Show Announcement',
    description: 'Promote your upcoming concerts and live performances with venue details and ticket links',
    category: 'Events',
    icon: <Mic className="w-6 h-6" />,
    preview: '/api/template-preview/show-announcement',
    fields: ['Artist Name', 'Show Title', 'Venue', 'Date & Time', 'Ticket Link', 'Event Details']
  },
  {
    id: 'merchandise',
    name: 'Merchandise',
    description: 'Showcase your latest merch drops with product images, pricing, and discount codes',
    category: 'Commerce',
    icon: <ShoppingBag className="w-6 h-6" />,
    preview: '/api/template-preview/merchandise',
    fields: ['Artist Name', 'Collection Name', 'Products', 'Shop Link', 'Discount Code', 'Description']
  },
  {
    id: 'blank',
    name: 'Start from Scratch',
    description: 'Build your email from the ground up with our drag-and-drop editor',
    category: 'Custom',
    icon: <FileText className="w-6 h-6" />,
    preview: '/api/template-preview/blank',
    fields: ['Complete creative freedom']
  }
];

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Choose a Template</h1>
              <p className="text-sm text-gray-600">Start with a professional template or build from scratch</p>
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
            <Badge variant="outline">Music</Badge>
            <Badge variant="outline">Events</Badge>
            <Badge variant="outline">Commerce</Badge>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.category === 'Music' ? 'bg-purple-100 text-purple-600' :
                      template.category === 'Events' ? 'bg-red-100 text-red-600' :
                      template.category === 'Commerce' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
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
                <div className="bg-gray-100 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm mx-auto mb-2 flex items-center justify-center">
                      {template.icon}
                    </div>
                    <p className="text-xs">Template Preview</p>
                  </div>
                </div>
                
                {/* Template Fields */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.fields.slice(0, 3).map((field, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {template.fields.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.fields.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {templates.find(t => t.id === selectedTemplate)?.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {templates.find(t => t.id === selectedTemplate)?.description}
                </p>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">This template includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {templates.find(t => t.id === selectedTemplate)?.fields.map((field, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleContinue} className="flex items-center gap-2">
                Use This Template
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}