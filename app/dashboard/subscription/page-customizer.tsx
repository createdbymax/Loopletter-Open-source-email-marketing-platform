"use client";

import { useState } from "react";
import { Artist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  onSave: (settings: SubscriptionPageSettings) => Promise<void>;
}

export default function PageCustomizer({
  artist,
  onSave,
}: PageCustomizerProps) {
  // Default settings if none are saved
  const DEFAULT_SETTINGS: SubscriptionPageSettings = {
    theme: "gradient",
    colors: {
      primary: artist.settings?.brand_colors?.primary || "#3b82f6",
      secondary: artist.settings?.brand_colors?.secondary || "#1d4ed8",
      accent: "#8b5cf6",
    },
    layout: "default",
    header: {
      title: `Join ${artist.name}'s Inner Circle`,
      subtitle:
        "Get exclusive updates, early access to new music, and personal messages",
      show_social_links: true,
      show_artist_image: false,
      artist_image_url: null,
    },
    form: {
      button_text: "Join the Family",
      button_style: "gradient",
      show_name_field: true,
      placeholder_email: "your@email.com",
      placeholder_name: "Your first name",
    },
    benefits: {
      show_benefits: true,
      custom_benefits: [
        "Early access to new releases",
        "Exclusive behind-the-scenes content",
        "Personal updates and stories",
        "Tour announcements and presale access",
      ],
    },
    success_message: {
      title: "Welcome to the family! 🎉",
      message: `You're now part of ${artist.name}'s inner circle. Get ready for exclusive content, early access to new music, and behind-the-scenes updates.`,
    },
  };

  // Get existing settings or use defaults
  const [settings, setSettings] = useState(
    artist.settings?.subscription_page_settings || DEFAULT_SETTINGS
  );
  const [activeTab, setActiveTab] = useState("header");
  const [isSaving, setIsSaving] = useState(false);

  // Helper functions to update nested settings
  const updateHeaderSetting = (
    key: keyof SubscriptionPageSettings["header"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [key]: value,
      },
    }));
  };

  const updateFormSetting = (
    key: keyof SubscriptionPageSettings["form"],
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        [key]: value,
      },
    }));
  };

  // Generic function to update nested settings using path array
  const updateSettings = (path: string[], value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      // Navigate to the parent object
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }

      // Set the final value
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  // Helper function to update benefits array
  const updateBenefit = (index: number, value: string) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      const benefits = [...newSettings.benefits.custom_benefits];
      benefits[index] = value;
      newSettings.benefits.custom_benefits = benefits;
      return newSettings;
    });
  };

  // Helper function to add a new benefit
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

  // Helper function to remove a benefit
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
      await onSave(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Subscription Page</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="success">Success Message</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
          </TabsList>

          {/* Header Tab */}
          <TabsContent value="header" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header-title">Header Title</Label>
              <Input
                id="header-title"
                value={settings.header.title}
                onChange={(e) => updateHeaderSetting("title", e.target.value)}
                placeholder="Join the Inner Circle"
              />
              <p className="text-xs text-gray-500">
                Use {"{artist_name}"} to include your artist name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="header-subtitle">Header Subtitle</Label>
              <Textarea
                id="header-subtitle"
                value={settings.header.subtitle}
                onChange={(e) =>
                  updateHeaderSetting("subtitle", e.target.value)
                }
                placeholder="Get exclusive updates and early access"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-social-links"
                checked={settings.header.show_social_links}
                onCheckedChange={(checked) =>
                  updateHeaderSetting("show_social_links", checked)
                }
              />
              <Label htmlFor="show-social-links">Show Social Links</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-artist-image"
                checked={settings.header.show_artist_image}
                onCheckedChange={(checked) =>
                  updateHeaderSetting("show_artist_image", checked)
                }
              />
              <Label htmlFor="show-artist-image">Show Artist Image</Label>
            </div>

            {settings.header.show_artist_image && (
              <div className="space-y-2">
                <Label htmlFor="artist-image-url">Artist Image URL</Label>
                <Input
                  id="artist-image-url"
                  value={settings.header.artist_image_url || ""}
                  onChange={(e) =>
                    updateHeaderSetting("artist_image_url", e.target.value)
                  }
                  placeholder="https://example.com/your-image.jpg"
                />
              </div>
            )}
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={settings.form.button_text}
                onChange={(e) =>
                  updateFormSetting("button_text", e.target.value)
                }
                placeholder="Join Now"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-name-field"
                checked={settings.form.show_name_field}
                onCheckedChange={(checked) =>
                  updateFormSetting("show_name_field", checked)
                }
              />
              <Label htmlFor="show-name-field">Show Name Field</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder-email">Email Placeholder</Label>
              <Input
                id="placeholder-email"
                value={settings.form.placeholder_email}
                onChange={(e) =>
                  updateSettings(["form", "placeholder_email"], e.target.value)
                }
                placeholder="your@email.com"
              />
            </div>

            {settings.form.show_name_field && (
              <div className="space-y-2">
                <Label htmlFor="placeholder-name">Name Placeholder</Label>
                <Input
                  id="placeholder-name"
                  value={settings.form.placeholder_name}
                  onChange={(e) =>
                    updateSettings(["form", "placeholder_name"], e.target.value)
                  }
                  placeholder="Your first name"
                />
              </div>
            )}
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-benefits"
                checked={settings.benefits.show_benefits}
                onCheckedChange={(checked) =>
                  updateSettings(["benefits", "show_benefits"], checked)
                }
              />
              <Label htmlFor="show-benefits">Show Benefits Section</Label>
            </div>

            {settings.benefits.show_benefits && (
              <div className="space-y-4">
                <Label>Custom Benefits</Label>
                {settings.benefits.custom_benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBenefit(index)}
                      disabled={settings.benefits.custom_benefits.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addBenefit}
                  className="w-full"
                >
                  Add Benefit
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Success Message Tab */}
          <TabsContent value="success" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="success-title">Success Title</Label>
              <Input
                id="success-title"
                value={settings.success_message.title}
                onChange={(e) =>
                  updateSettings(["success_message", "title"], e.target.value)
                }
                placeholder="Welcome to the family! 🎉"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success-message">Success Message</Label>
              <Textarea
                id="success-message"
                value={settings.success_message.message}
                onChange={(e) =>
                  updateSettings(["success_message", "message"], e.target.value)
                }
                placeholder="You're now part of our inner circle..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Use {"{artist_name}"} to include your artist name
              </p>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={settings.colors.primary}
                    onChange={(e) =>
                      updateSettings(["colors", "primary"], e.target.value)
                    }
                    className="w-10 h-10 rounded-md border border-gray-300"
                  />
                  <Input
                    value={settings.colors.primary}
                    onChange={(e) =>
                      updateSettings(["colors", "primary"], e.target.value)
                    }
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondary-color"
                    value={settings.colors.secondary}
                    onChange={(e) =>
                      updateSettings(["colors", "secondary"], e.target.value)
                    }
                    className="w-10 h-10 rounded-md border border-gray-300"
                  />
                  <Input
                    value={settings.colors.secondary}
                    onChange={(e) =>
                      updateSettings(["colors", "secondary"], e.target.value)
                    }
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="accent-color"
                    value={settings.colors.accent}
                    onChange={(e) =>
                      updateSettings(["colors", "accent"], e.target.value)
                    }
                    className="w-10 h-10 rounded-md border border-gray-300"
                  />
                  <Input
                    value={settings.colors.accent}
                    onChange={(e) =>
                      updateSettings(["colors", "accent"], e.target.value)
                    }
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div
              className="mt-4 p-4 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${settings.colors.primary}, ${settings.colors.secondary})`,
                color: "white",
              }}
            >
              <h3 className="font-semibold mb-2">Preview</h3>
              <p>This is how your gradient will look</p>
              <div className="mt-4 flex justify-center">
                <Button
                  className="bg-white text-gray-900 hover:bg-gray-100"
                  style={{
                    boxShadow: `0 0 0 2px ${settings.colors.accent}`,
                  }}
                >
                  Button Preview
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6 gap-2">
          <Button
            variant="outline"
            onClick={() => setSettings(DEFAULT_SETTINGS)}
          >
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
