"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Upload, Plus, X } from "lucide-react";
import { 
  MusicReleaseTemplateProps, 
  ShowAnnouncementTemplateProps, 
  MerchandiseTemplateProps,
  ArtistPromoTemplateProps
} from "@/app/dashboard/email-templates";
import { ArtistPromoForm } from "./artist-promo-form";

interface TemplateFormProps {
  templateId: string;
  onBack: () => void;
  onContinue: (data: any) => void;
}

export function TemplateForm({ templateId, onBack, onContinue }: TemplateFormProps) {
  switch (templateId) {
    case 'music-release':
      return <MusicReleaseForm onBack={onBack} onContinue={onContinue} />;
    case 'show-announcement':
      return <ShowAnnouncementForm onBack={onBack} onContinue={onContinue} />;
    case 'merchandise':
      return <MerchandiseForm onBack={onBack} onContinue={onContinue} />;
    case 'artist-promo':
      return <ArtistPromoForm onBack={onBack} onContinue={onContinue} />;
    default:
      return <div>Template not found</div>;
  }
}

function MusicReleaseForm({ onBack, onContinue }: { onBack: () => void; onContinue: (data: MusicReleaseTemplateProps) => void }) {
  const [formData, setFormData] = useState<MusicReleaseTemplateProps>({
    artistName: '',
    releaseTitle: '',
    releaseType: 'single',
    releaseDate: '',
    artwork: '',
    description: '',
    spotifyUrl: '',
    appleMusicUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    websiteUrl: '',
    preOrderUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(formData);
  };

  const updateField = (field: keyof MusicReleaseTemplateProps, value: string) => {
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
              <h1 className="text-xl font-semibold">Music Release Template</h1>
              <p className="text-sm text-gray-600">Fill in your release details</p>
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
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Release Information</CardTitle>
              <CardDescription>Basic details about your music release</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artistName">Artist Name *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => updateField('artistName', e.target.value)}
                    placeholder="Your artist name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="releaseTitle">Release Title *</Label>
                  <Input
                    id="releaseTitle"
                    value={formData.releaseTitle}
                    onChange={(e) => updateField('releaseTitle', e.target.value)}
                    placeholder="Song or album title"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="releaseType">Release Type</Label>
                  <Select value={formData.releaseType} onValueChange={(value) => updateField('releaseType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="EP">EP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => updateField('releaseDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell your fans about this release - the inspiration, the story, what it means to you..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Artwork */}
          <Card>
            <CardHeader>
              <CardTitle>Artwork</CardTitle>
              <CardDescription>Upload or link to your release artwork</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="artwork">Artwork URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="artwork"
                    value={formData.artwork}
                    onChange={(e) => updateField('artwork', e.target.value)}
                    placeholder="https://example.com/artwork.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {formData.artwork && (
                  <div className="mt-4">
                    <img 
                      src={formData.artwork} 
                      alt="Artwork preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Streaming Links */}
          <Card>
            <CardHeader>
              <CardTitle>Streaming & Purchase Links</CardTitle>
              <CardDescription>Add links to streaming platforms and stores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spotifyUrl">Spotify URL</Label>
                  <Input
                    id="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={(e) => updateField('spotifyUrl', e.target.value)}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="appleMusicUrl">Apple Music URL</Label>
                  <Input
                    id="appleMusicUrl"
                    value={formData.appleMusicUrl}
                    onChange={(e) => updateField('appleMusicUrl', e.target.value)}
                    placeholder="https://music.apple.com/..."
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
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <Label htmlFor="preOrderUrl">Pre-Order/Purchase URL</Label>
                  <Input
                    id="preOrderUrl"
                    value={formData.preOrderUrl}
                    onChange={(e) => updateField('preOrderUrl', e.target.value)}
                    placeholder="https://store.example.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect with your fans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => updateField('websiteUrl', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

function ShowAnnouncementForm({ onBack, onContinue }: { onBack: () => void; onContinue: (data: ShowAnnouncementTemplateProps) => void }) {
  const [formData, setFormData] = useState<ShowAnnouncementTemplateProps>({
    artistName: '',
    showTitle: '',
    venue: '',
    city: '',
    date: '',
    time: '',
    ticketUrl: '',
    venueAddress: '',
    supportingActs: '',
    ticketPrice: '',
    ageRestriction: 'All Ages',
    posterImage: '',
    description: '',
    instagramUrl: '',
    websiteUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(formData);
  };

  const updateField = (field: keyof ShowAnnouncementTemplateProps, value: string) => {
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
              <h1 className="text-xl font-semibold">Show Announcement Template</h1>
              <p className="text-sm text-gray-600">Fill in your event details</p>
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
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Basic details about your show</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artistName">Artist Name *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => updateField('artistName', e.target.value)}
                    placeholder="Your artist name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="showTitle">Show Title</Label>
                  <Input
                    id="showTitle"
                    value={formData.showTitle}
                    onChange={(e) => updateField('showTitle', e.target.value)}
                    placeholder="Tour name or special event title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell your fans why this show is special, what to expect, and why they shouldn't miss it..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Venue & Date */}
          <Card>
            <CardHeader>
              <CardTitle>Venue & Date</CardTitle>
              <CardDescription>Where and when is your show?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => updateField('venue', e.target.value)}
                    placeholder="The Venue Name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City, State *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Los Angeles, CA"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venueAddress">Venue Address</Label>
                <Input
                  id="venueAddress"
                  value={formData.venueAddress}
                  onChange={(e) => updateField('venueAddress', e.target.value)}
                  placeholder="123 Music St, Los Angeles, CA 90210"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => updateField('time', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets & Details</CardTitle>
              <CardDescription>Ticket information and show details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ticketPrice">Ticket Price</Label>
                  <Input
                    id="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={(e) => updateField('ticketPrice', e.target.value)}
                    placeholder="$25"
                  />
                </div>
                <div>
                  <Label htmlFor="ageRestriction">Age Restriction</Label>
                  <Select value={formData.ageRestriction} onValueChange={(value) => updateField('ageRestriction', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Ages">All Ages</SelectItem>
                      <SelectItem value="18+">18+</SelectItem>
                      <SelectItem value="21+">21+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ticketUrl">Ticket URL</Label>
                  <Input
                    id="ticketUrl"
                    value={formData.ticketUrl}
                    onChange={(e) => updateField('ticketUrl', e.target.value)}
                    placeholder="https://tickets.example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supportingActs">Supporting Acts</Label>
                <Input
                  id="supportingActs"
                  value={formData.supportingActs}
                  onChange={(e) => updateField('supportingActs', e.target.value)}
                  placeholder="Opening bands or special guests"
                />
              </div>
            </CardContent>
          </Card>

          {/* Poster & Social */}
          <Card>
            <CardHeader>
              <CardTitle>Poster & Social Media</CardTitle>
              <CardDescription>Visual assets and social links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="posterImage">Event Poster URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="posterImage"
                    value={formData.posterImage}
                    onChange={(e) => updateField('posterImage', e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => updateField('websiteUrl', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

function MerchandiseForm({ onBack, onContinue }: { onBack: () => void; onContinue: (data: MerchandiseTemplateProps) => void }) {
  const [formData, setFormData] = useState<MerchandiseTemplateProps>({
    artistName: '',
    collectionName: '',
    description: '',
    featuredImage: '',
    shopUrl: '',
    items: [
      { name: '', price: '' }
    ],
    limitedTime: false,
    discountCode: '',
    discountPercent: '',
    instagramUrl: '',
    websiteUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(formData);
  };

  const updateField = (field: keyof MerchandiseTemplateProps, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', price: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || []
    }));
  };

  const updateItem = (index: number, field: 'name' | 'price' | 'image', value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
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
              <h1 className="text-xl font-semibold">Merchandise Template</h1>
              <p className="text-sm text-gray-600">Fill in your merch details</p>
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
          {/* Collection Information */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Information</CardTitle>
              <CardDescription>Basic details about your merchandise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artistName">Artist Name *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => updateField('artistName', e.target.value)}
                    placeholder="Your artist name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="collectionName">Collection Name *</Label>
                  <Input
                    id="collectionName"
                    value={formData.collectionName}
                    onChange={(e) => updateField('collectionName', e.target.value)}
                    placeholder="Summer 2024 Collection"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell your fans about this merch drop - the design inspiration, quality, and why they'll love it..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="shopUrl">Shop URL *</Label>
                <Input
                  id="shopUrl"
                  value={formData.shopUrl}
                  onChange={(e) => updateField('shopUrl', e.target.value)}
                  placeholder="https://shop.example.com"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
              <CardDescription>Main image for your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => updateField('featuredImage', e.target.value)}
                    placeholder="https://example.com/collection.jpg"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Add the products in your collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items?.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {formData.items && formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="T-Shirt, Hoodie, etc."
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        placeholder="$25"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Item Image URL (optional)</Label>
                    <Input
                      value={item.image || ''}
                      onChange={(e) => updateItem(index, 'image', e.target.value)}
                      placeholder="https://example.com/item.jpg"
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>Promotions</CardTitle>
              <CardDescription>Special offers and discounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="limitedTime"
                  checked={formData.limitedTime}
                  onCheckedChange={(checked) => updateField('limitedTime', checked)}
                />
                <Label htmlFor="limitedTime">Limited time offer</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountCode">Discount Code</Label>
                  <Input
                    id="discountCode"
                    value={formData.discountCode}
                    onChange={(e) => updateField('discountCode', e.target.value)}
                    placeholder="SAVE20"
                  />
                </div>
                <div>
                  <Label htmlFor="discountPercent">Discount Percentage</Label>
                  <Input
                    id="discountPercent"
                    value={formData.discountPercent}
                    onChange={(e) => updateField('discountPercent', e.target.value)}
                    placeholder="20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect with your fans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => updateField('websiteUrl', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}