"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, Clock, Send, Users, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
interface CampaignSendingModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    fanCount: number;
    onComplete: (result: SendResult) => void;
}
interface SendResult {
    success: boolean;
    queued?: boolean;
    sentCount?: number;
    failedCount?: number;
    totalCount: number;
    errors?: string[];
    jobId?: string;
    estimatedTime?: string;
    status?: string;
}
export function CampaignSendingModal({ isOpen, onClose, campaignId, fanCount, onComplete, }: CampaignSendingModalProps) {
    const [step, setStep] = useState<"preparing" | "sending" | "queued" | "complete" | "error">("preparing");
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<SendResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { track } = useAnalytics();
    const hasSentRef = useRef(false);
    useEffect(() => {
        if (!isOpen) {
            setStep("preparing");
            setProgress(0);
            setResult(null);
            setError(null);
            hasSentRef.current = false;
            return;
        }
        if (!hasSentRef.current) {
            hasSentRef.current = true;
            sendCampaign();
        }
    }, [isOpen, campaignId]);
    const sendCampaign = async () => {
        try {
            setStep("preparing");
            setProgress(10);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setStep("sending");
            setProgress(30);
            const response = await fetch(`/api/campaigns/${campaignId}/send`, {
                method: "POST",
            });
            const sendResult = await response.json();
            if (response.ok) {
                setProgress(90);
                await new Promise((resolve) => setTimeout(resolve, 500));
                setResult(sendResult);
                if (sendResult.queued) {
                    setStep("queued");
                    setProgress(100);
                    track("Campaign Queued", {
                        campaign_id: campaignId,
                        recipient_count: sendResult.totalCount,
                        estimated_time: sendResult.estimatedTime,
                        job_id: sendResult.jobId,
                    });
                }
                else {
                    setStep("complete");
                    setProgress(100);
                    track("Campaign Send Completed", {
                        campaign_id: campaignId,
                        recipient_count: sendResult.sentCount || 0,
                        failed_count: sendResult.failedCount || 0,
                        success_rate: sendResult.sentCount
                            ? (sendResult.sentCount / sendResult.totalCount) * 100
                            : 0,
                    });
                }
                onComplete(sendResult);
            }
            else {
                throw new Error(sendResult.error || "Failed to send campaign");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            setStep("error");
            track("Campaign Send Failed", {
                campaign_id: campaignId,
                error_message: errorMessage,
                fan_count: fanCount,
            });
        }
    };
    const handleViewAnalytics = () => {
        track("Campaign Analytics Viewed", {
            campaign_id: campaignId,
            source: "send_modal",
        });
        window.location.href = `/dashboard/analytics?campaign=${campaignId}`;
    };
    const handleClose = () => {
        if (step === "complete" || step === "queued") {
            window.location.href = "/dashboard/campaigns";
        }
        else {
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        
        <div className="flex items-center justify-between p-6 border-b dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100">
            {step === "preparing" && "Preparing Campaign"}
            {step === "sending" && "Queueing Campaign"}
            {step === "queued" && "Campaign Queued!"}
            {step === "complete" && "Campaign Sent!"}
            {step === "error" && "Send Failed"}
          </h2>
          {step !== "sending" && (<button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300">
              <X className="w-5 h-5"/>
            </button>)}
        </div>

        
        <div className="p-6">
          
          {step === "preparing" && (<div className="text-center">
              <div className="mb-4">
                <Clock className="w-12 h-12 text-blue-500 mx-auto animate-pulse"/>
              </div>
              <p className="text-gray-600 dark:text-neutral-400 mb-4">
                Preparing your campaign for delivery...
              </p>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
              </div>
            </div>)}

          
          {step === "sending" && (<div className="text-center">
              <div className="mb-4">
                <Send className="w-12 h-12 text-blue-500 mx-auto animate-bounce"/>
              </div>
              <p className="text-gray-600 dark:text-neutral-400 mb-2">
                Queueing campaign for {fanCount.toLocaleString()} subscribed fans...
              </p>
              <p className="text-sm text-gray-500 dark:text-neutral-500 mb-4">
                Your campaign will be sent respecting rate limits
              </p>
              <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
              </div>
            </div>)}

          
          {step === "queued" && result && (<div className="text-center">
              <div className="mb-4">
                <Clock className="w-12 h-12 text-orange-500 mx-auto"/>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                Campaign Successfully Queued!
              </h3>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-600 mr-2"/>
                    <span className="font-semibold">
                      {result.totalCount.toLocaleString()} subscribed fans
                    </span>
                  </div>

                  {result.estimatedTime && (<div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600 mr-2"/>
                      <span>Estimated time: {result.estimatedTime}</span>
                    </div>)}

                  <p className="text-orange-700 dark:text-orange-300 mt-3">
                    Your campaign is now in the sending queue and will be
                    delivered automatically while respecting AWS SES rate
                    limits.
                    {process.env.NODE_ENV === 'development' && (<span className="block mt-2 text-sm">
                        <strong>Development Mode:</strong> Queue processing will start automatically in a few seconds.
                      </span>)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => (window.location.href = "/dashboard/campaigns")} className="w-full">
                  View All Campaigns
                </Button>

                <Button variant="outline" onClick={() => (window.location.href = `/dashboard/campaigns/${campaignId}/edit`)} className="w-full">
                  Monitor Progress
                </Button>
              </div>
            </div>)}

          
          {step === "complete" && result && (<div className="text-center">
              <div className="mb-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto"/>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-4">
                Campaign Sent Successfully!
              </h3>

              
              <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-green-500 mr-1"/>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {(result.sentCount || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-neutral-400">
                      Delivered
                    </p>
                  </div>

                  {(result.failedCount || 0) > 0 && (<div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <X className="w-4 h-4 text-red-500 mr-1"/>
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {(result.failedCount || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-neutral-400">
                        Failed
                      </p>
                    </div>)}
                </div>

                {(result.failedCount || 0) > 0 && (<div className="mt-3 pt-3 border-t dark:border-neutral-600">
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      Success Rate:{" "}
                      {Math.round(((result.sentCount || 0) / result.totalCount) * 100)}
                      %
                    </p>
                  </div>)}
              </div>

              
              <div className="space-y-3">
                <Button onClick={handleViewAnalytics} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <TrendingUp className="w-4 h-4 mr-2"/>
                  View Campaign Analytics
                </Button>

                <Button onClick={handleClose} variant="outline" className="w-full">
                  Back to Campaigns
                </Button>
              </div>
            </div>)}

          
          {step === "error" && (<div className="text-center">
              <div className="mb-4">
                <X className="w-12 h-12 text-red-500 mx-auto"/>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
                Send Failed
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>)}
        </div>
      </div>
    </div>);
}
