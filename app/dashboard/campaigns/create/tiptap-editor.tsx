"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEmailDesigner } from "@/components/email-builder/tiptap-email-designer";
import { ArrowLeft, Save, Send, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
interface TiptapEditorProps {
    onBack: () => void;
    onSave: (htmlContent: string) => void;
    onSend: (htmlContent: string) => void;
    initialHtml?: string;
}
export function TiptapEditor({ onBack, onSave, onSend, initialHtml, }: TiptapEditorProps) {
    const [generatedHtml, setGeneratedHtml] = useState<string>(initialHtml || "");
    const [showSettings, setShowSettings] = useState(false);
    const [emailData, setEmailData] = useState({
        subject: "",
        from: "",
        previewText: "",
    });
    const [campaignSettings, setCampaignSettings] = useState({
        track_opens: true,
        track_clicks: true,
        send_time_optimization: false,
    });
    const handleSaveClick = () => {
        if (generatedHtml) {
            onSave(generatedHtml);
        }
    };
    const handleSendClick = () => {
        if (generatedHtml) {
            onSend(generatedHtml);
        }
    };
    return (<div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back
          </Button>
          <h2 className="text-xl font-semibold">Email Designer</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowSettings(!showSettings)} className={showSettings ? "bg-gray-100" : ""}>
            <Settings className="h-4 w-4 mr-2"/>
            Settings
          </Button>
          <Button variant="outline" onClick={handleSaveClick}>
            <Save className="h-4 w-4 mr-2"/>
            Save Draft
          </Button>
          <Button onClick={handleSendClick}>
            <Send className="h-4 w-4 mr-2"/>
            Continue to Send
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        <div className={`flex-1 overflow-hidden ${showSettings ? "w-3/4" : "w-full"}`}>
          <TiptapEmailDesigner initialContent={initialHtml} onChange={(html) => setGeneratedHtml(html)} onSave={(html) => {
            setGeneratedHtml(html);
            onSave(html);
        }} emailSubject={emailData.subject}/>
        </div>

        
        {showSettings && (<div className="w-1/4 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium mb-4">Email Settings</h3>

              <Tabs defaultValue="metadata">
                <TabsList className="w-full">
                  <TabsTrigger value="metadata" className="flex-1">
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="tracking" className="flex-1">
                    Tracking
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="metadata" className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input id="subject" value={emailData.subject} onChange={(e) => setEmailData((prev) => ({
                ...prev,
                subject: e.target.value,
            }))} placeholder="Enter subject line..." className="mt-1"/>
                  </div>

                  <div>
                    <Label htmlFor="from">From</Label>
                    <Input id="from" value={emailData.from} onChange={(e) => setEmailData((prev) => ({
                ...prev,
                from: e.target.value,
            }))} placeholder="your-name@domain.com" className="mt-1"/>
                  </div>

                  <div>
                    <Label htmlFor="preview">Preview Text</Label>
                    <Input id="preview" value={emailData.previewText} onChange={(e) => setEmailData((prev) => ({
                ...prev,
                previewText: e.target.value,
            }))} placeholder="This appears in inbox preview..." className="mt-1"/>
                    <p className="text-xs text-gray-500 mt-1">
                      This text will appear in the recipient&apos;s inbox preview.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="tracking" className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Track Email Opens
                      </Label>
                      <p className="text-xs text-gray-600">
                        Know when recipients open your emails
                      </p>
                    </div>
                    <Switch checked={campaignSettings.track_opens} onCheckedChange={(checked) => setCampaignSettings((prev) => ({
                ...prev,
                track_opens: checked,
            }))}/>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Track Link Clicks
                      </Label>
                      <p className="text-xs text-gray-600">
                        Track which links recipients click
                      </p>
                    </div>
                    <Switch checked={campaignSettings.track_clicks} onCheckedChange={(checked) => setCampaignSettings((prev) => ({
                ...prev,
                track_clicks: checked,
            }))}/>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Send Time Optimization
                      </Label>
                      <p className="text-xs text-gray-600">
                        Send at optimal times for each recipient
                      </p>
                    </div>
                    <Switch checked={campaignSettings.send_time_optimization} onCheckedChange={(checked) => setCampaignSettings((prev) => ({
                ...prev,
                send_time_optimization: checked,
            }))}/>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>)}
      </div>
    </div>);
}
