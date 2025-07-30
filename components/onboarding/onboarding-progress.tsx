"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  X,
  Users,
  Mail,
  Settings,
  Globe,
  Sparkles,
} from "lucide-react";
import { Artist, Fan, Campaign } from "@/lib/types";
import {
  getOnboardingStatus,
  getOnboardingRecommendations,
  getOnboardingData,
} from "@/lib/onboarding";
import Link from "next/link";

interface OnboardingProgressProps {
  artist: Artist;
  fans: Fan[];
  campaigns: Campaign[];
  onDismiss?: () => void;
  onStartOnboarding?: () => void;
}

export function OnboardingProgress({
  artist,
  fans,
  campaigns,
  onDismiss,
  onStartOnboarding,
}: OnboardingProgressProps) {
  const status = getOnboardingStatus(artist, fans, campaigns);
  const data = getOnboardingData(artist, fans, campaigns);
  const recommendations = getOnboardingRecommendations(status, data);

  // Don't show if onboarding is complete
  if (status.isComplete) {
    return null;
  }

  const steps = [
    {
      id: "profile",
      title: "Complete Profile",
      icon: Settings,
      completed: status.completedSteps.includes("profile"),
    },
    {
      id: "audience",
      title: "Add Fans",
      icon: Users,
      completed: status.completedSteps.includes("audience"),
    },
    {
      id: "domain",
      title: "Verify Domain",
      icon: Globe,
      completed: status.completedSteps.includes("domain"),
      optional: true,
    },
    {
      id: "campaign",
      title: "Create Campaign",
      icon: Mail,
      completed: status.completedSteps.includes("campaign"),
    },
  ];

  const topRecommendation = recommendations[0];

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
                Complete Your Setup
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Get the most out of Loopletter
              </p>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {status.completedSteps.length} of{" "}
              {steps.filter((s) => !s.optional).length} steps completed
            </span>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            >
              {Math.round(status.progress)}%
            </Badge>
          </div>
          <Progress value={status.progress} className="h-2" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div
                className={`
                w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                ${
                  step.completed
                    ? "bg-green-100 text-green-600 border-2 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : "bg-neutral-100 text-neutral-400 border-2 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700"
                }
              `}
              >
                {step.completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    step.completed
                      ? "text-green-700 dark:text-green-400"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {step.title}
                </p>
                {step.optional && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Optional
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Recommendation */}
        {topRecommendation && (
          <div className="bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  {topRecommendation.title}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {topRecommendation.description}
                </p>
              </div>
              <Link href={topRecommendation.href}>
                <Button size="sm">
                  {topRecommendation.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {onStartOnboarding && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartOnboarding}
              className="flex-1"
            >
              Start Guided Setup
            </Button>
          )}
          <Link href="/dashboard/settings?tab=profile" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">
              Manual Setup
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
