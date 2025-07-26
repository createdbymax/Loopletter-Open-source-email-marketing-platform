"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Users, BarChart3, Zap, Sparkles, CheckCircle } from 'lucide-react';
import { Artist } from '@/lib/types';

interface WelcomeStepProps {
  artist: Artist;
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Mail,
      title: 'Professional Email Campaigns',
      description: 'Create beautiful, responsive emails with our drag-and-drop editor'
    },
    {
      icon: Users,
      title: 'Audience Management',
      description: 'Organize and segment your fans for targeted messaging'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track opens, clicks, and engagement to optimize your campaigns'
    },
    {
      icon: Zap,
      title: 'Marketing Automation',
      description: 'Set up automated welcome series and engagement campaigns'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full border mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Ready to grow your fanbase?</span>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of artists who use Loopletter to connect with fans, 
          promote releases, and build sustainable music careers through effective email marketing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="bg-primary p-3 rounded-lg">
                <feature.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 p-6 rounded-lg border">
        <div className="flex items-start gap-4">
          <div className="bg-primary p-2 rounded-md">
            <CheckCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold mb-3">What we'll set up together:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Complete your artist profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Add your first fans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Set up domain verification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Create your first campaign</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <Button 
          onClick={onNext} 
          size="lg" 
          className="px-8"
        >
          Let's Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span>Takes about 5 minutes • Skip anytime</span>
        </div>
      </div>
    </div>
  );
}