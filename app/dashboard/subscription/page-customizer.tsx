"use client";
import { useState } from "react";
import { Artist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Save, X } from "lucide-react";
interface SubscriptionPageSettings {
    theme: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    layout: string;
    header: {
        title: string;
        subtitle: string;
        show_social_links: boolean;
        show_artist_image: boolean;
        artist_image_url: string | null;
    };
    form: {
        button_text: string;
        button_style: string;
        show_name_field: boolean;
        placeholder_email: string;
        placeholder_name: string;
    };
    benefits: {
        show_benefits: boolean;
        custom_benefits: string[];
    };
    success_message: {
        title: string;
        message: string;
    };
}
interface PageCustomizerProps {
    artist: Artist;
    onSave: () => Promise<void>;
    onClose?: () => void;
}
export default function PageCustomizer({ artist, onSave, onClose, }: PageCustomizerProps) {
    const DEFAULT_SETTINGS: SubscriptionPageSettings = {
        theme: "dark",
        colors: {
            primary: "#2563eb",
            secondary: "#0891b2",
            accent: "#06b6d4",
        },
        layout: "modern",
        header: {
            title: `Join {artist_name}'s Inner Circle`,
            subtitle: "Get exclusive access to unreleased tracks, behind-the-scenes content, and priority event access.",
            show_social_links: true,
            show_artist_image: false,
            artist_image_url: null,
        },
        form: {
            button_text: "Request Access",
            button_style: "gradient",
            show_name_field: true,
            placeholder_email: "your@email.com",
            placeholder_name: "Enter your first name",
        },
        benefits: {
            show_benefits: true,
            custom_benefits: [
                "Early Access - First to experience new releases",
                "Exclusive Content - Behind-the-scenes and unreleased material",
                "Priority Events - VIP access to shows and experiences",
            ],
        },
        success_message: {
            title: "Access Granted 🎉",
            message: `You're now part of the exclusive network. Prepare for early access to unreleased content and behind-the-scenes experiences.`,
        },
    };
    const [settings, setSettings] = useState(artist.settings?.subscription_page_settings || DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState("header");
    const [isSaving, setIsSaving] = useState(false);
    const updateHeaderSetting = (key: keyof SubscriptionPageSettings["header"], value: any) => {
        setSettings((prev) => ({
            ...prev,
            header: {
                ...prev.header,
                [key]: value,
            },
        }));
    };
    const updateFormSetting = (key: keyof SubscriptionPageSettings["form"], value: any) => {
        setSettings((prev) => ({
            ...prev,
            form: {
                ...prev.form,
                [key]: value,
            },
        }));
    };
    const updateSettings = (path: string[], value: any) => {
        setSettings((prev) => {
            const newSettings = { ...prev };
            let current: any = newSettings;
            for (let i = 0; i < path.length - 1; i++) {
                current[path[i]] = { ...current[path[i]] };
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newSettings;
        });
    };
    const updateBenefit = (index: number, value: string) => {
        setSettings((prev) => {
            const newSettings = { ...prev };
            const benefits = [...newSettings.benefits.custom_benefits];
            benefits[index] = value;
            newSettings.benefits.custom_benefits = benefits;
            return newSettings;
        });
    };
    const addBenefit = () => {
        setSettings((prev) => {
            const newSettings = { ...prev };
            newSettings.benefits.custom_benefits = [
                ...newSettings.benefits.custom_benefits,
                "",
            ];
            return newSettings;
        });
    };
    const removeBenefit = (index: number) => {
        setSettings((prev) => {
            const newSettings = { ...prev };
            const benefits = [...newSettings.benefits.custom_benefits];
            benefits.splice(index, 1);
            newSettings.benefits.custom_benefits = benefits;
            return newSettings;
        });
    };
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave();
        }
        catch (error) {
            console.error("Error saving settings:", error);
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="success">Success Message</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>

          
          <TabsContent value="header" className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-purple-900 mb-2">Modern Dark Theme Header</h4>
              <p className="text-sm text-purple-800">
                Your header features a large, elegant title with gradient text effects. 
                The "Inner Circle" branding creates an exclusive feel that encourages signups.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="header-title">Header Title</Label>
              <Input id="header-title" value={settings.header.title} onChange={(e) => updateHeaderSetting("title", e.target.value)} placeholder="Join {artist_name}'s Inner Circle"/>
              <p className="text-xs text-gray-500">
                Use {"{artist_name}"} to include your artist name. The second line will be styled with a gradient effect.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="header-subtitle">Header Subtitle</Label>
              <Textarea id="header-subtitle" value={settings.header.subtitle} onChange={(e) => updateHeaderSetting("subtitle", e.target.value)} placeholder="Get exclusive updates and early access" rows={2}/>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-social-links" checked={settings.header.show_social_links} onCheckedChange={(checked) => updateHeaderSetting("show_social_links", checked)}/>
              <Label htmlFor="show-social-links">Show Social Links</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-artist-image" checked={settings.header.show_artist_image} onCheckedChange={(checked) => updateHeaderSetting("show_artist_image", checked)}/>
              <Label htmlFor="show-artist-image">Show Artist Image</Label>
            </div>

            {settings.header.show_artist_image && (<div className="space-y-2">
                <Label htmlFor="artist-image-url">Artist Image URL</Label>
                <Input id="artist-image-url" value={settings.header.artist_image_url || ""} onChange={(e) => updateHeaderSetting("artist_image_url", e.target.value)} placeholder="https://example.com/your-image.jpg"/>
              </div>)}
          </TabsContent>

          
          <TabsContent value="form" className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-900 mb-2">Glass Morphism Form</h4>
              <p className="text-sm text-green-800">
                The form uses a modern glass morphism design with dark inputs and gradient buttons. 
                The button will use your selected gradient colors for maximum visual impact.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input id="button-text" value={settings.form.button_text} onChange={(e) => updateFormSetting("button_text", e.target.value)} placeholder="Request Access"/>
              <p className="text-xs text-gray-500">
                This text appears on the gradient button with an arrow icon
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-name-field" checked={settings.form.show_name_field} onCheckedChange={(checked) => updateFormSetting("show_name_field", checked)}/>
              <Label htmlFor="show-name-field">Show Name Field</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder-email">Email Placeholder</Label>
              <Input id="placeholder-email" value={settings.form.placeholder_email} onChange={(e) => updateSettings(["form", "placeholder_email"], e.target.value)} placeholder="your@email.com"/>
            </div>

            {settings.form.show_name_field && (<div className="space-y-2">
                <Label htmlFor="placeholder-name">Name Placeholder</Label>
                <Input id="placeholder-name" value={settings.form.placeholder_name} onChange={(e) => updateSettings(["form", "placeholder_name"], e.target.value)} placeholder="Your first name"/>
              </div>)}
          </TabsContent>

          
          <TabsContent value="benefits" className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-orange-900 mb-2">Feature Highlights</h4>
              <p className="text-sm text-orange-800">
                Benefits are displayed with elegant gradient dot icons in a clean grid layout. 
                Use format "Title - Description" for best results (e.g., "Early Access - First to experience new releases").
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="show-benefits" checked={settings.benefits.show_benefits} onCheckedChange={(checked) => updateSettings(["benefits", "show_benefits"], checked)}/>
              <Label htmlFor="show-benefits">Show Benefits Section</Label>
            </div>

            {settings.benefits.show_benefits && (<div className="space-y-4">
                <Label>Custom Benefits (Top 3 will be featured)</Label>
                {settings.benefits.custom_benefits.map((benefit, index) => (<div key={index} className="flex items-center gap-2">
                    <Input value={benefit} onChange={(e) => updateBenefit(index, e.target.value)} placeholder={`Benefit ${index + 1}`}/>
                    <Button variant="ghost" size="icon" onClick={() => removeBenefit(index)} disabled={settings.benefits.custom_benefits.length <= 1}>
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>))}

                <Button variant="outline" onClick={addBenefit} className="w-full">
                  Add Benefit
                </Button>
              </div>)}
          </TabsContent>

          
          <TabsContent value="success" className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-emerald-900 mb-2">Success Celebration</h4>
              <p className="text-sm text-emerald-800">
                After signup, users see a beautiful celebration screen with a gradient check icon 
                and your custom message, followed by their top benefits with dot indicators.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="success-title">Success Title</Label>
              <Input id="success-title" value={settings.success_message.title} onChange={(e) => updateSettings(["success_message", "title"], e.target.value)} placeholder="Access Granted 🎉"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea id="success-message" value={settings.success_message.message} onChange={(e) => updateSettings(["success_message", "message"], e.target.value)} placeholder="You're now part of our inner circle..." rows={3}/>
              <p className="text-xs text-gray-500">
                Use {"{artist_name}"} to include your artist name
              </p>
            </div>
          </TabsContent>

          
          <TabsContent value="colors" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Dark Theme Color System</h4>
              <p className="text-sm text-blue-800">
                Your subscription page uses a modern dark theme with gradient effects. 
                The primary and secondary colors create the gradient for buttons and accents, 
                while maintaining excellent readability on the dark background.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" id="primary-color" value={settings.colors.primary} onChange={(e) => updateSettings(["colors", "primary"], e.target.value)} className="w-10 h-10 rounded-md border border-gray-300"/>
                  <Input value={settings.colors.primary} onChange={(e) => updateSettings(["colors", "primary"], e.target.value)} className="font-mono"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" id="secondary-color" value={settings.colors.secondary} onChange={(e) => updateSettings(["colors", "secondary"], e.target.value)} className="w-10 h-10 rounded-md border border-gray-300"/>
                  <Input value={settings.colors.secondary} onChange={(e) => updateSettings(["colors", "secondary"], e.target.value)} className="font-mono"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" id="accent-color" value={settings.colors.accent} onChange={(e) => updateSettings(["colors", "accent"], e.target.value)} className="w-10 h-10 rounded-md border border-gray-300"/>
                  <Input value={settings.colors.accent} onChange={(e) => updateSettings(["colors", "accent"], e.target.value)} className="font-mono"/>
                </div>
              </div>
            </div>

            
            <div className="mt-6 p-6 bg-gray-950 rounded-xl border border-gray-800 relative overflow-hidden">
              
              <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              
              <div className="relative z-10">
                <h3 className="font-semibold mb-4 text-white">Dark Theme Preview</h3>
                
                
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-blue-300 font-medium">Exclusive Access</span>
                  </div>
                  <h4 className="text-lg font-light text-white mb-2">
                    Join {artist.name}'s
                    <span className="block bg-gradient-to-r bg-clip-text text-transparent" style={{
            backgroundImage: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`
        }}>
                      Inner Circle
                    </span>
                  </h4>
                </div>

                
                <div className="flex justify-center">
                  <button className="px-6 py-3 text-white font-medium rounded-xl transition-all duration-300 shadow-lg" style={{
            background: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`,
            boxShadow: `0 10px 25px -5px ${settings.colors.primary}40, 0 4px 6px -2px ${settings.colors.primary}20`
        }}>
                    {settings.form.button_text}
                  </button>
                </div>

                
                <div className="mt-4 space-y-2">
                  {settings.benefits.custom_benefits.slice(0, 2).map((benefit, index) => (<div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full" style={{
                background: `linear-gradient(to right, ${settings.colors.primary}, ${settings.colors.secondary})`
            }}></div>
                      <span className="text-gray-300">{benefit.split(' - ')[0]}</span>
                    </div>))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>
          Reset to Default
        </Button>
        
        <div className="flex gap-2">
          {onClose && (<Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>)}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (<>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                Saving...
              </>) : (<>
                <Save className="h-4 w-4 mr-2"/>
                Save Changes
              </>)}
          </Button>
        </div>
      </div>
    </div>);
}
