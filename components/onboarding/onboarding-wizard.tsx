"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Users, Mail, Settings, Globe, Sparkles, Send, } from "lucide-react";
import { Artist } from "@/lib/types";
import { WelcomeStep } from "./steps/welcome-step";
import { ProfileStep } from "./steps/profile-step";
import { AudienceStep } from "./steps/audience-step";
import { DomainStep } from "./steps/domain-step";
import { FirstCampaignStep } from "./steps/first-campaign-step";
import { CompletionStep } from "./steps/completion-step";
import Image from "next/image";
export type OnboardingStep = {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
    completed: boolean;
    optional?: boolean;
};
interface OnboardingWizardProps {
    artist: Artist;
    onComplete: () => void;
    onSkip: () => void;
}
export function OnboardingWizard({ artist, onComplete, onSkip, }: OnboardingWizardProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState<OnboardingStep[]>([
        {
            id: "welcome",
            title: "Welcome to Loopletter",
            description: "Get started with your email marketing journey",
            icon: Sparkles,
            completed: false,
        },
        {
            id: "profile",
            title: "Complete Your Profile",
            description: "Set up your artist profile and preferences",
            icon: Settings,
            completed: false,
        },
        {
            id: "audience",
            title: "Add Your First Fans",
            description: "Import or add subscribers to build your audience",
            icon: Users,
            completed: false,
        },
        {
            id: "domain",
            title: "Set Up Your Domain",
            description: "Improve deliverability with domain verification",
            icon: Globe,
            completed: false,
            optional: true,
        },
        {
            id: "campaign",
            title: "Create Your First Campaign",
            description: "Design and send your first email campaign",
            icon: Mail,
            completed: false,
        },
        {
            id: "completion",
            title: "You're All Set!",
            description: "Your account is ready for email marketing success",
            icon: CheckCircle,
            completed: false,
        },
    ]);
    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setSteps((prev) => prev.map((step, index) => index === currentStepIndex ? { ...step, completed: true } : step));
            setCurrentStepIndex((prev) => prev + 1);
        }
    };
    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
        }
    };
    const handleSkipStep = () => {
        if (currentStep.optional) {
            handleNext();
        }
    };
    const handleStepComplete = (stepId: string) => {
        setSteps((prev) => prev.map((step) => step.id === stepId ? { ...step, completed: true } : step));
    };
    const handleFinish = () => {
        setSteps((prev) => prev.map((step) => ({ ...step, completed: true })));
        onComplete();
    };
    const renderStepContent = () => {
        switch (currentStep.id) {
            case "welcome":
                return <WelcomeStep artist={artist} onNext={handleNext}/>;
            case "profile":
                return (<ProfileStep artist={artist} onNext={handleNext} onStepComplete={() => handleStepComplete("profile")}/>);
            case "audience":
                return (<AudienceStep artist={artist} onNext={handleNext} onStepComplete={() => handleStepComplete("audience")}/>);
            case "domain":
                return (<DomainStep artist={artist} onNext={handleNext} onSkip={handleSkipStep} onStepComplete={() => handleStepComplete("domain")}/>);
            case "campaign":
                return (<FirstCampaignStep artist={artist} onNext={handleNext} onStepComplete={() => handleStepComplete("campaign")}/>);
            case "completion":
                return <CompletionStep artist={artist} onFinish={handleFinish}/>;
            default:
                return null;
        }
    };
    return (<div className="h-screen bg-background flex">
      
      <div className="w-80 bg-card border-r flex flex-col">
        
        <div className="p-6 border-b bg-card">
          <div className="flex items-center gap-3">
            
            <div className="relative group cursor-pointer">
              <Image src="/newlogo.svg" alt="Loopletter" width={125} height={32} className="flex-shrink-0"/>
              <Send className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-500 opacity-70 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:scale-110"/>
            </div>
            
          </div>
        </div>

        
        <div className="p-6 border-b">
          <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Setup Progress</span>
              <span className="text-lg font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {steps.filter((s) => s.completed).length} of {steps.length} steps
              completed
            </p>
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
              Setup Steps
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (<div key={step.id} className={`
                    relative flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer
                    ${index === currentStepIndex
                ? "bg-primary text-primary-foreground"
                : step.completed
                    ? "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                    : index < currentStepIndex
                        ? "bg-muted/50 hover:bg-muted text-muted-foreground"
                        : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"}
                  `} onClick={() => {
                if (index <= currentStepIndex) {
                    setCurrentStepIndex(index);
                }
            }}>
                  
                  <div className={`
                    w-8 h-8 rounded-md flex items-center justify-center mr-3 transition-all duration-200
                    ${index === currentStepIndex
                ? "bg-primary-foreground/20 text-primary-foreground"
                : step.completed
                    ? "bg-green-500 text-white"
                    : index < currentStepIndex
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground/50"}
                  `}>
                    {step.completed ? (<CheckCircle className="w-4 h-4"/>) : index === currentStepIndex ? (<step.icon className="w-4 h-4"/>) : (<span className="text-xs font-medium">{index + 1}</span>)}
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {step.title}
                      </h4>
                      {step.optional && (<span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          Optional
                        </span>)}
                    </div>
                    <p className="text-xs mt-0.5 truncate opacity-80">
                      {step.description}
                    </p>
                  </div>

                  
                  {index === currentStepIndex && (<div className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse ml-2"></div>)}
                </div>))}
            </div>
          </div>
        </div>

        
        <div className="border-t bg-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-muted-foreground truncate">
                Welcome, {artist.name}!
              </div>
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs h-7 px-2 shrink-0">
                Skip Setup
              </Button>
            </div>

            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentStepIndex === 0} className="flex-1">
                <ArrowLeft className="w-3 h-3 mr-1"/>
                Back
              </Button>
              {currentStep.optional && (<Button variant="ghost" size="sm" onClick={handleSkipStep} className="text-xs px-3 shrink-0">
                  Skip
                </Button>)}
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex-1 bg-background flex flex-col">
        
        <div className="border-b bg-card shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {currentStep.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              
              <div className="bg-card rounded-lg border shadow-sm">
                <div className="p-6">{renderStepContent()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
