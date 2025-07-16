"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsManager } from "./integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { getOrCreateArtistByClerkId, updateArtist } from "@/lib/db";
import type { Artist, ArtistSettings } from "@/lib/types";

function ProfileSettings() {
  const { user } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    settings: {
      timezone: "UTC",
      send_time_optimization: false,
      double_opt_in: false,
      unsubscribe_redirect_url: "",
      brand_colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
      },
      social_links: {
        website: "",
        instagram: "",
        twitter: "",
        spotify: "",
      },
    } as ArtistSettings,
  });

  useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        setFormData({
          name: a.name || "",
          bio: a.bio || "",
          email: a.email || "",
          settings: {
            timezone: a.settings?.timezone || "UTC",
            send_time_optimization: a.settings?.send_time_optimization || false,
            double_opt_in: a.settings?.double_opt_in || false,
            unsubscribe_redirect_url:
              a.settings?.unsubscribe_redirect_url || "",
            brand_colors: {
              primary: a.settings?.brand_colors?.primary || "#3b82f6",
              secondary: a.settings?.brand_colors?.secondary || "#64748b",
            },
            social_links: {
              website: a.settings?.social_links?.website || "",
              instagram: a.settings?.social_links?.instagram || "",
              twitter: a.settings?.social_links?.twitter || "",
              spotify: a.settings?.social_links?.spotify || "",
            },
          },
        });
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [user]);

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      await updateArtist(artist.id, {
        name: formData.name,
        bio: formData.bio,
        settings: formData.settings,
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSettings = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        social_links: {
          ...prev.settings.social_links,
          [platform]: value,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to update profile. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="artist-name">Artist Name</Label>
              <Input
                id="artist-name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your artist name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email is managed by your account settings
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Tell your fans about yourself..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.settings.timezone}
              onValueChange={(value) => updateSettings("timezone", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">
                  UTC (Coordinated Universal Time)
                </SelectItem>
                <SelectItem value="America/New_York">
                  Eastern Time (UTC-5/-4)
                </SelectItem>
                <SelectItem value="America/Chicago">
                  Central Time (UTC-6/-5)
                </SelectItem>
                <SelectItem value="America/Denver">
                  Mountain Time (UTC-7/-6)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  Pacific Time (UTC-8/-7)
                </SelectItem>
                <SelectItem value="America/Phoenix">
                  Arizona Time (UTC-7)
                </SelectItem>
                <SelectItem value="America/Anchorage">
                  Alaska Time (UTC-9/-8)
                </SelectItem>
                <SelectItem value="Pacific/Honolulu">
                  Hawaii Time (UTC-10)
                </SelectItem>
                <SelectItem value="Europe/London">London (UTC+0/+1)</SelectItem>
                <SelectItem value="Europe/Paris">Paris (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/Berlin">Berlin (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/Rome">Rome (UTC+1/+2)</SelectItem>
                <SelectItem value="Europe/Madrid">Madrid (UTC+1/+2)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                <SelectItem value="Asia/Shanghai">Shanghai (UTC+8)</SelectItem>
                <SelectItem value="Asia/Seoul">Seoul (UTC+9)</SelectItem>
                <SelectItem value="Asia/Mumbai">Mumbai (UTC+5:30)</SelectItem>
                <SelectItem value="Asia/Dubai">Dubai (UTC+4)</SelectItem>
                <SelectItem value="Australia/Sydney">
                  Sydney (UTC+10/+11)
                </SelectItem>
                <SelectItem value="Australia/Melbourne">
                  Melbourne (UTC+10/+11)
                </SelectItem>
                <SelectItem value="Pacific/Auckland">
                  Auckland (UTC+12/+13)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Send Time Optimization</Label>
                <p className="text-sm text-gray-600">
                  Automatically optimize send times for better engagement
                </p>
              </div>
              <Switch
                checked={formData.settings.send_time_optimization}
                onCheckedChange={(checked) =>
                  updateSettings("send_time_optimization", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Double Opt-in</Label>
                <p className="text-sm text-gray-600">
                  Require email confirmation for new subscribers
                </p>
              </div>
              <Switch
                checked={formData.settings.double_opt_in}
                onCheckedChange={(checked) =>
                  updateSettings("double_opt_in", checked)
                }
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website-url">Website</Label>
            <Input
              id="website-url"
              value={formData.settings.social_links.website}
              onChange={(e) => updateSocialLink("website", e.target.value)}
              placeholder="https://your-artist-website.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.settings.social_links.instagram}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="@your_artist_name"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={formData.settings.social_links.twitter}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="@your_artist_name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="spotify">Spotify Artist URL</Label>
            <Input
              id="spotify"
              value={formData.settings.social_links.spotify}
              onChange={(e) => updateSocialLink("spotify", e.target.value)}
              placeholder="https://open.spotify.com/artist/your-artist-id"
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Social Links
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const { user } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [notifications, setNotifications] = useState({
    campaign_sent: true,
    new_subscribers: true,
    weekly_reports: true,
    system_updates: true,
    notification_email: "",
    frequency: "instant" as "instant" | "hourly" | "daily" | "weekly",
  });

  useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);

        // Load notification preferences from artist settings
        const settings = a.settings as any;
        setNotifications({
          campaign_sent: settings?.notifications?.campaign_sent ?? true,
          new_subscribers: settings?.notifications?.new_subscribers ?? true,
          weekly_reports: settings?.notifications?.weekly_reports ?? true,
          system_updates: settings?.notifications?.system_updates ?? true,
          notification_email:
            settings?.notifications?.notification_email || a.email,
          frequency: settings?.notifications?.frequency || "instant",
        });
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [user]);

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const updatedSettings = {
        ...artist.settings,
        notifications,
      };

      await updateArtist(artist.id, { settings: updatedSettings });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving notifications:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: string, value: any) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Notification settings updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to update settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Campaign Sent</Label>
              <p className="text-sm text-gray-600">
                Get notified when campaigns are sent
              </p>
            </div>
            <Switch
              checked={notifications.campaign_sent}
              onCheckedChange={(checked) =>
                updateNotification("campaign_sent", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>New Subscribers</Label>
              <p className="text-sm text-gray-600">
                Get notified about new subscribers
              </p>
            </div>
            <Switch
              checked={notifications.new_subscribers}
              onCheckedChange={(checked) =>
                updateNotification("new_subscribers", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-gray-600">
                Receive weekly performance summaries
              </p>
            </div>
            <Switch
              checked={notifications.weekly_reports}
              onCheckedChange={(checked) =>
                updateNotification("weekly_reports", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>System Updates</Label>
              <p className="text-sm text-gray-600">
                Important platform updates and maintenance
              </p>
            </div>
            <Switch
              checked={notifications.system_updates}
              onCheckedChange={(checked) =>
                updateNotification("system_updates", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={notifications.notification_email}
              onChange={(e) =>
                updateNotification("notification_email", e.target.value)
              }
              placeholder={
                user?.primaryEmailAddress?.emailAddress ||
                "your-email@example.com"
              }
            />
            <p className="text-sm text-gray-600 mt-1">
              Where to send notifications (can be different from your login
              email)
            </p>
          </div>

          <div>
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={notifications.frequency}
              onValueChange={(value) => updateNotification("frequency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandingSettings() {
  const { user } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [branding, setBranding] = useState({
    brand_colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
    },
    logo_url: "",
    email_footer: "",
    social_links: {
      website: "",
      instagram: "",
      twitter: "",
      spotify: "",
      youtube: "",
    },
  });

  useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(a);

        const settings = a.settings as any;
        setBranding({
          brand_colors: {
            primary: settings?.brand_colors?.primary || "#3b82f6",
            secondary: settings?.brand_colors?.secondary || "#64748b",
          },
          logo_url: settings?.logo_url || "",
          email_footer: settings?.email_footer || "",
          social_links: {
            website: settings?.social_links?.website || "",
            instagram: settings?.social_links?.instagram || "",
            twitter: settings?.social_links?.twitter || "",
            spotify: settings?.social_links?.spotify || "",
            youtube: settings?.social_links?.youtube || "",
          },
        });
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [user]);

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const updatedSettings = {
        ...artist.settings,
        ...branding,
      };

      await updateArtist(artist.id, { settings: updatedSettings });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving branding:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateBrandColors = (color: "primary" | "secondary", value: string) => {
    setBranding((prev) => ({
      ...prev,
      brand_colors: {
        ...prev.brand_colors,
        [color]: value,
      },
    }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setBranding((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Branding settings updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to update branding settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={branding.brand_colors.primary}
                  onChange={(e) => updateBrandColors("primary", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.brand_colors.primary}
                  onChange={(e) => updateBrandColors("primary", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={branding.brand_colors.secondary}
                  onChange={(e) =>
                    updateBrandColors("secondary", e.target.value)
                  }
                  className="w-16 h-10"
                />
                <Input
                  value={branding.brand_colors.secondary}
                  onChange={(e) =>
                    updateBrandColors("secondary", e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={branding.logo_url}
              onChange={(e) =>
                setBranding((prev) => ({ ...prev, logo_url: e.target.value }))
              }
              placeholder="https://your-domain.com/logo.png"
            />
            <p className="text-sm text-gray-600 mt-1">
              Enter a direct URL to your logo image (PNG, JPG, or SVG
              recommended)
            </p>
            {branding.logo_url && (
              <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                <img
                  src={branding.logo_url}
                  alt="Logo preview"
                  className="h-12 object-contain border rounded"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const errorMsg = target.nextElementSibling as HTMLElement;
                    if (errorMsg) errorMsg.style.display = "block";
                  }}
                />
                <p className="text-sm text-red-600 mt-2 hidden">
                  Unable to load image. Please check the URL.
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email-footer">Email Footer</Label>
            <Textarea
              id="email-footer"
              value={branding.email_footer}
              onChange={(e) =>
                setBranding((prev) => ({
                  ...prev,
                  email_footer: e.target.value,
                }))
              }
              placeholder="© 2024 Your Artist Name. All rights reserved.&#10;Follow us on social media for updates!"
              rows={3}
            />
            <p className="text-sm text-gray-600 mt-1">
              This text will appear at the bottom of all your email campaigns
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Brand Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website-url">Website</Label>
            <Input
              id="website-url"
              value={branding.social_links.website}
              onChange={(e) => updateSocialLink("website", e.target.value)}
              placeholder="https://your-artist-website.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={branding.social_links.instagram}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="@your_artist_name"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={branding.social_links.twitter}
                onChange={(e) => updateSocialLink("twitter", e.target.value)}
                placeholder="@your_artist_name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="spotify">Spotify</Label>
              <Input
                id="spotify"
                value={branding.social_links.spotify}
                onChange={(e) => updateSocialLink("spotify", e.target.value)}
                placeholder="https://open.spotify.com/artist/your-artist-id"
              />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={branding.social_links.youtube}
                onChange={(e) => updateSocialLink("youtube", e.target.value)}
                placeholder="https://youtube.com/@your_artist_name"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Social Links
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              API Keys Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              Secure API key management for integrating with external services
              will be available soon.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">
                Planned Features:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Generate secure API keys for third-party integrations</li>
                <li>• Manage key permissions and scopes</li>
                <li>• Monitor API usage and activity logs</li>
                <li>• Revoke and rotate keys as needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base">Login Activity</Label>
              <p className="text-sm text-gray-600">
                Monitor recent login attempts and active sessions
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base">Data Export</Label>
              <p className="text-sm text-gray-600">
                Download your account data and campaign history
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Delete Account</Label>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <Button variant="destructive" disabled>
              Delete Account (Coming Soon)
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Account deletion functionality will be available in a future
              update with proper data handling and confirmation workflows.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsManager />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
