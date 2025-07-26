"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight,
  X,
  Users,
  Mail,
  Settings,
  Globe
} from 'lucide-react';
import { Artist, Fan, Campaign } from '@/lib/types';
import { getOnboardingStatus, getOnboardingRecommendations, getOnboardingData } from '@/lib/onboarding';
import Link from 'next/link';

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
  onStartOnboarding 
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
      id: 'profile',
      title: 'Complete Profile',
      icon: Settings,
      completed: status.completedSteps.includes('profile'),
    },
    {
      id: 'audience',
      title: 'Add Fans',
      icon: Users,
      completed: status.completedSteps.includes('audience'),
    },
    {
      id: 'domain',
      title: 'Verify Domain',
      icon: Globe,
      completed: status.completedSteps.includes('domain'),
      optional: true,
    },
    {
      id: 'campaign',
      title: 'Create Campaign',
      icon: Mail,
      completed: status.completedSteps.includes('campaign'),
    },
  ];

  const topRecommendation = recommendations[0];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
      <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Circle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900">Complete Your Setup</h3>
                <p className="text-sm text-blue-700">Get the most out of Loopletter</p>
              </div>
            </div>
            {onDismiss && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDismiss}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {status.completedSteps.length} of {steps.filter(s => !s.optional).length} steps completed
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {Math.round(status.progress)}%
              </span>
            </div>
            <div className="relative">
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${status.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 pt-2 space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between relative">
            {/* Connection line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-blue-200 -z-10"></div>
            <div 
              className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 -z-10 transition-all duration-700"
              style={{ width: `${(status.completedSteps.length / steps.length) * 100}%` }}
            ></div>
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 transform
                  ${step.completed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-400 border-2 border-blue-200'}
                `}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className={`text-xs text-center font-medium max-w-16 ${
                  step.completed ? 'text-green-700' : 'text-blue-600'
                }`}>
                  {step.title}
                  {step.optional && (
                    <div className="text-xs text-blue-400 mt-1">Optional</div>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Next recommendation */}
          {topRecommendation && (
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {topRecommendation.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {topRecommendation.description}
                  </p>
                </div>
                <Link href={topRecommendation.href}>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {topRecommendation.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {onStartOnboarding && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onStartOnboarding}
                className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300 text-blue-700 rounded-xl"
              >
                Start Guided Setup
              </Button>
            )}
            <Link href="/dashboard/settings?tab=profile">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-xl"
              >
                Manual Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}