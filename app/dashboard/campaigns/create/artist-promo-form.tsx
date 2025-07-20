"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { ArtistPromoTemplateProps } from "@/app/dashboard/email-templates";

interface ArtistPromoFormProps {
  onBack: () => void;
  onContinue: (data: ArtistPromoTemplateProps) => void;
}

export function ArtistPromoForm({ onBack, onContinue }: ArtistPromoFormProps) {
  const [formData, setFormData] = useState<ArtistPromoTemplateProps>({
    artistName: '',
    mainBannerImage: 'https://image.e.warnerrecords.com/lib/fe9712737764027d72/m/1/d72caa3c-bfa0-4853-a3d4-7af7fd71bda9.jpg',
    artistLogoImage: 'https://image.e.warnerrecords.com/lib/fe9712737764027d72/m/1/f57d2bd6-a7a9-47a2-868b-f25006464646.jpg',
    promoGifImage: 'https://image.e.warnerrecords.com/lib/fe9712737764027d72/m/1/aceaf2cf-be8b-478a-b91b-d4db56266cea.gif',
    shopNowImage: 'https://image.e.warnerrecords.com/lib/fe9712737764027d72/m/1/76bd4f79-04ac-4ed5-bd59-4654a06bc856.jpg',
    shopUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    recordLabel: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(formData);
  };

  const updateField = (field: keyof ArtistPromoTemplateProps, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Artist Promo Template</h1>
              <p className="text-sm text-gray-600">Fill in your artist promotion details</p>
            </div>
          </div>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            Continue to Editor
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Information */}
          <Card>
            <CardHeader>
              <CardTitle>Artist Information</CardTitle>
              <CardDescription>Basic details about the artist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artistName">Artist Name *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => updateField('artistName', e.target.value)}
                    placeholder="Artist name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recordLabel">Record Label</Label>
                  <Input
                    id="recordLabel"
                    value={formData.recordLabel}
                    onChange={(e) => updateField('recordLabel', e.target.value)}
                    placeholder="Record label name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Visual assets for your email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mainBannerImage">Main Banner Image URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="mainBannerImage"
                    value={formData.mainBannerImage}
                    onChange={(e) => updateField('mainBannerImage', e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.mainBannerImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.mainBannerImage} 
                      alt="Main Banner preview" 
                      className="w-full max-h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="artistLogoImage">Artist Logo Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="artistLogoImage"
                    value={formData.artistLogoImage}
                    onChange={(e) => updateField('artistLogoImage', e.target.value)}
                    placeholder="https://example.com/logo.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.artistLogoImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.artistLogoImage} 
                      alt="Artist Logo preview" 
                      className="max-h-20 object-contain rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="promoGifImage">Promo GIF/Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoGifImage"
                    value={formData.promoGifImage}
                    onChange={(e) => updateField('promoGifImage', e.target.value)}
                    placeholder="https://example.com/promo.gif"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.promoGifImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.promoGifImage} 
                      alt="Promo GIF preview" 
                      className="w-full max-h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="shopNowImage">Shop Now Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="shopNowImage"
                    value={formData.shopNowImage}
                    onChange={(e) => updateField('shopNowImage', e.target.value)}
                    placeholder="https://example.com/shop.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.shopNowImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.shopNowImage} 
                      alt="Shop Now preview" 
                      className="w-full max-h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Shop and social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shopUrl">Shop URL</Label>
                <Input
                  id="shopUrl"
                  value={formData.shopUrl}
                  onChange={(e) => updateField('shopUrl', e.target.value)}
                  placeholder="https://shop.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/artist"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktokUrl">TikTok URL</Label>
                  <Input
                    id="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={(e) => updateField('tiktokUrl', e.target.value)}
                    placeholder="https://tiktok.com/@artist"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => updateField('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/artist"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) => updateField('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/artist"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) => updateField('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/artist"
                  />
                </div>
                <div>
                  <Label htmlFor="spotifyUrl">Spotify URL</Label>
                  <Input
                    id="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={(e) => updateField('spotifyUrl', e.target.value)}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="appleMusicUrl">Apple Music URL</Label>
                <Input
                  id="appleMusicUrl"
                  value={formData.appleMusicUrl}
                  onChange={(e) => updateField('appleMusicUrl', e.target.value)}
                  placeholder="https://music.apple.com/artist/..."
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}