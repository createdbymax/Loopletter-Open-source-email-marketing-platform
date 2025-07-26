"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowRight,
  Mail,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Artist } from "@/lib/types";
import Link from "next/link";

interface CompletionStepProps {
  artist: Artist;
  onFinish: () => void;
}

export function CompletionStep({ artist, onFinish }: CompletionStepProps) {
  const nextSteps = [
    {
      icon: Mail,
      title: "Create More Campaigns",
      description:
        "Build on your first campaign with more templates and designs",
      href: "/dashboard/campaigns/create",
      action: "Create Campaign",
    },
    {
      icon: Users,
      title: "Grow Your Audience",
      description: "Add more fans and create segments for targeted messaging",
      href: "/dashboard/fans",
      action: "Manage Fans",
    },
    {
      icon: BarChart3,
      title: "Track Performance",
      description: "Monitor your campaign analytics and engagement metrics",
      href: "/dashboard/analytics",
      action: "View Analytics",
    },
    {
      icon: Settings,
      title: "Customize Settings",
      description: "Set up automations, team access, and advanced features",
      href: "/dashboard/settings",
      action: "Open Settings",
    },
  ];

  const resources = [
    {
      title: "Email Marketing Best Practices",
      description: "Learn how to write engaging emails that convert",
      href: "https://docs.loopletter.com/best-practices",
    },
    {
      title: "Growing Your Email List",
      description: "Strategies to attract and retain more subscribers",
      href: "https://docs.loopletter.com/list-growth",
    },
    {
      title: "Understanding Analytics",
      description: "Make sense of your campaign performance data",
      href: "https://docs.loopletter.com/analytics",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h3 className="text-2xl font-semibold mb-3">All set, {artist.name}!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your Loopletter account is ready. You can now start building your
          audience and creating campaigns.
        </p>
      </div>

      {/* What's Been Set Up */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-md">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="font-semibold">Setup Complete</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Profile completed</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">First fans added</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Domain configured</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">First campaign created</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h4 className="font-semibold mb-4">What's next?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nextSteps.map((step, index) => (
            <div
              key={index}
              className="bg-card p-4 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-md">
                  <step.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{step.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  <Link href={step.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-8 text-xs"
                    >
                      {step.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-3">Helpful Resources</h4>
        <div className="space-y-2">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-card rounded-md border"
            >
              <div>
                <h5 className="font-medium text-sm">{resource.title}</h5>
                <p className="text-xs text-muted-foreground">
                  {resource.description}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="bg-muted/50 p-4 rounded-lg border text-center">
        <h4 className="font-medium mb-2">Need Help?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Our support team is here to help you succeed with email marketing.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://docs.loopletter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:support@loopletter.com">Contact Support</a>
          </Button>
        </div>
      </div>

      {/* Finish Button */}
      <div className="text-center pt-6">
        <Button onClick={onFinish} size="lg" className="px-8">
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Ready to start your email marketing journey!
        </p>
      </div>
    </div>
  );
}
