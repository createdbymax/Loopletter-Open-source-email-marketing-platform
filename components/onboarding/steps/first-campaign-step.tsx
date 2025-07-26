"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  Mail, 
  Eye, 
  Send,
  Sparkles,
  Music,
  Calendar,
  Gift
} from 'lucide-react';
import { Artist } from '@/lib/types';

interface FirstCampaignStepProps {
  artist: Artist;
  onNext: () => void;
  onStepComplete: () => void;
}

export function FirstCampaignStep({ artist, onNext, onStepComplete }: FirstCampaignStepProps) {
  const [campaignType, setCampaignType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    message: '',
    sendNow: false,
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'template' | 'content' | 'preview'>('template');

  const templates = [
    {
      id: 'welcome',
      title: 'Welcome Message',
      description: 'Introduce yourself to new fans',
      icon: Sparkles,
      subject: 'Welcome to my music journey! 🎵',
      message: `Hey there!

Thanks for joining my email list! I'm so excited to have you along for this musical journey.

I'll be sharing updates about new releases, behind-the-scenes content, and exclusive opportunities just for my email subscribers.

Stay tuned for some amazing music coming your way!

Much love,
${artist.name}`
    },
    {
      id: 'release',
      title: 'New Release Announcement',
      description: 'Announce your latest track or album',
      icon: Music,
      subject: 'New music is here! 🎶',
      message: `Hey music lovers!

I'm thrilled to announce that my new [SONG/ALBUM NAME] is now available everywhere!

This project means so much to me, and I can't wait for you to hear it.

Listen now: [ADD YOUR STREAMING LINKS]

Let me know what you think - I love hearing from you!

Rock on,
${artist.name}`
    },
    {
      id: 'show',
      title: 'Show Announcement',
      description: 'Promote your upcoming performances',
      icon: Calendar,
      subject: 'See me live! Upcoming shows 🎤',
      message: `Hey everyone!

I'm excited to announce some upcoming shows! Here's where you can catch me live:

[DATE] - [VENUE] - [CITY]
[DATE] - [VENUE] - [CITY]

Tickets are available now at [TICKET LINK]

Can't wait to see you there and perform these songs live!

See you soon,
${artist.name}`
    },
    {
      id: 'merch',
      title: 'Merchandise Promotion',
      description: 'Promote your latest merchandise',
      icon: Gift,
      subject: 'New merch drop! 👕',
      message: `Hey fans!

I've got some exciting new merchandise available in my store!

Check out the new designs and grab your favorites before they're gone.

Shop now: [MERCH STORE LINK]

Thanks for supporting my music!

Best,
${artist.name}`
    }
  ];

  const selectedTemplate = templates.find(t => t.id === campaignType);

  const handleTemplateSelect = (templateId: string) => {
    setCampaignType(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: `${template.title} - ${new Date().toLocaleDateString()}`,
        subject: template.subject,
        message: template.message,
      }));
      setStep('content');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          message: formData.message,
          status: formData.sendNow ? 'sending' : 'draft',
          template_id: campaignType,
          settings: {
            send_time_optimization: false,
            track_opens: true,
            track_clicks: true,
            auto_tweet: false,
            send_to_unsubscribed: false,
          },
        }),
      });

      if (response.ok) {
        onStepComplete();
        onNext();
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      // Handle error - could show toast notification
    } finally {
      setLoading(false);
    }
  };

  if (step === 'template') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Choose a template to create your first campaign. You can customize it in the next step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <template.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>{template.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onNext}>
            Skip campaign creation
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'content') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Customize your {selectedTemplate?.title.toLowerCase()} campaign
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Internal name for your campaign"
            />
          </div>

          <div>
            <Label htmlFor="subject">Email Subject Line</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="What your fans will see in their inbox"
            />
          </div>

          <div>
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Your email content..."
              rows={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Personalize the message by replacing placeholder text with your specific details
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('template')}>
            Back to Templates
          </Button>
          <Button onClick={() => setStep('preview')}>
            Preview
            <Eye className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Review your campaign before sending or saving as draft
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Subject Line</Label>
              <p className="font-medium">{formData.subject}</p>
            </div>
            
            <div>
              <Label className="text-sm text-gray-500">From</Label>
              <p>{artist.name} &lt;{artist.email}&gt;</p>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm text-gray-500">Message</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {formData.message}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save as draft: You can edit and send later from your campaigns page</li>
            <li>• Send now: Your campaign will be sent to all your subscribers immediately</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep('content')}>
            Edit Content
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setFormData(prev => ({ ...prev, sendNow: false }));
                handleSubmit();
              }}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button 
              onClick={() => {
                setFormData(prev => ({ ...prev, sendNow: true }));
                handleSubmit();
              }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Send Now'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}