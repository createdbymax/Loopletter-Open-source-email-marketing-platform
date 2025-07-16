"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Upload, ArrowLeft } from "lucide-react";
import { 
  MusicReleaseTemplateProps, 
  ShowAnnouncementTemplateProps, 
  MerchandiseTemplateProps 
} from "@/app/dashboard/email-templates";

interface TemplateEditorProps {
  templateId: string;
  templateData: any;
  onUpdate: (data: any) => void;
}

export function TemplateEditor({ templateId, templateData, onUpdate }: TemplateEditorProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...templateData, [field]: value });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...(templateData.items || [])];
    items[index] = { ...items[index], [field]: value };
    onUpdate({ ...templateData, items });
  };

  const addItem = () => {
    const items = [...(templateData.items || [])];
    items.push({ name: '', price: '', image: '' });
    onUpdate({ ...templateData, items });
  };

  const removeItem = (index: number) => {
    const items = [...(templateData.items || [])];
    items.splice(index, 1);
    onUpdate({ ...templateData, items });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Template Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">
            Edit your template fields below and see changes in real-time.
          </p>
        </CardContent>
      </Card>

      {/* Template-specific editors */}
      {templateId === 'music-release' && (
        <MusicReleaseEditor data={templateData} onUpdate={updateField} />
      )}
      
      {templateId === 'show-announcement' && (
        <ShowAnnouncementEditor data={templateData} onUpdate={updateField} />
      )}
      
      {templateId === 'merchandise' && (
        <MerchandiseEditor 
          data={templateData} 
          onUpdate={updateField}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      )}
    </div>
  );
}

function MusicReleaseEditor({ data, onUpdate }: { data: MusicReleaseTemplateProps; onUpdate: (field: string, value: any) => void }) {
  return (
    <>
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Release Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Artist Name</Label>
            <Input
              value={data.artistName || ''}
              onChange={(e) => onUpdate('artistName', e.target.value)}
              placeholder="Your artist name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Release Title</Label>
            <Input
              value={data.releaseTitle || ''}
              onChange={(e) => onUpdate('releaseTitle', e.target.value)}
              placeholder="Song or album title"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Release Type</Label>
            <Select value={data.releaseType} onValueChange={(value) => onUpdate('releaseType', value)}>
              <SelectTrigger className="h-8 text-sm">
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
            <Label className="text-xs">Release Date</Label>
            <Input
              type="date"
              value={data.releaseDate || ''}
              onChange={(e) => onUpdate('releaseDate', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Artwork */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Artwork</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs">Artwork URL</Label>
            <Input
              value={data.artwork || ''}
              onChange={(e) => onUpdate('artwork', e.target.value)}
              placeholder="https://example.com/artwork.jpg"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Tell your fans about this release..."
            className="text-sm resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Streaming Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Streaming Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Spotify URL</Label>
            <Input
              value={data.spotifyUrl || ''}
              onChange={(e) => onUpdate('spotifyUrl', e.target.value)}
              placeholder="https://open.spotify.com/..."
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Apple Music URL</Label>
            <Input
              value={data.appleMusicUrl || ''}
              onChange={(e) => onUpdate('appleMusicUrl', e.target.value)}
              placeholder="https://music.apple.com/..."
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">YouTube URL</Label>
            <Input
              value={data.youtubeUrl || ''}
              onChange={(e) => onUpdate('youtubeUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Pre-Order URL</Label>
            <Input
              value={data.preOrderUrl || ''}
              onChange={(e) => onUpdate('preOrderUrl', e.target.value)}
              placeholder="https://store.example.com/..."
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Instagram URL</Label>
            <Input
              value={data.instagramUrl || ''}
              onChange={(e) => onUpdate('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourusername"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Website URL</Label>
            <Input
              value={data.websiteUrl || ''}
              onChange={(e) => onUpdate('websiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ShowAnnouncementEditor({ data, onUpdate }: { data: ShowAnnouncementTemplateProps; onUpdate: (field: string, value: any) => void }) {
  return (
    <>
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Event Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Artist Name</Label>
            <Input
              value={data.artistName || ''}
              onChange={(e) => onUpdate('artistName', e.target.value)}
              placeholder="Your artist name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Show Title</Label>
            <Input
              value={data.showTitle || ''}
              onChange={(e) => onUpdate('showTitle', e.target.value)}
              placeholder="Tour name or event title"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Venue & Date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Venue & Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Venue Name</Label>
            <Input
              value={data.venue || ''}
              onChange={(e) => onUpdate('venue', e.target.value)}
              placeholder="The Venue Name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">City, State</Label>
            <Input
              value={data.city || ''}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="Los Angeles, CA"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Venue Address</Label>
            <Input
              value={data.venueAddress || ''}
              onChange={(e) => onUpdate('venueAddress', e.target.value)}
              placeholder="123 Music St, Los Angeles, CA"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={data.date || ''}
              onChange={(e) => onUpdate('date', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Time</Label>
            <Input
              type="time"
              value={data.time || ''}
              onChange={(e) => onUpdate('time', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tickets & Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Ticket Price</Label>
            <Input
              value={data.ticketPrice || ''}
              onChange={(e) => onUpdate('ticketPrice', e.target.value)}
              placeholder="$25"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Age Restriction</Label>
            <Select value={data.ageRestriction} onValueChange={(value) => onUpdate('ageRestriction', value)}>
              <SelectTrigger className="h-8 text-sm">
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
            <Label className="text-xs">Ticket URL</Label>
            <Input
              value={data.ticketUrl || ''}
              onChange={(e) => onUpdate('ticketUrl', e.target.value)}
              placeholder="https://tickets.example.com"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Supporting Acts</Label>
            <Input
              value={data.supportingActs || ''}
              onChange={(e) => onUpdate('supportingActs', e.target.value)}
              placeholder="Opening bands or special guests"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Tell your fans why this show is special..."
            className="text-sm resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Poster & Social */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Poster & Social</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Event Poster URL</Label>
            <Input
              value={data.posterImage || ''}
              onChange={(e) => onUpdate('posterImage', e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Instagram URL</Label>
            <Input
              value={data.instagramUrl || ''}
              onChange={(e) => onUpdate('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourusername"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Website URL</Label>
            <Input
              value={data.websiteUrl || ''}
              onChange={(e) => onUpdate('websiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function MerchandiseEditor({ 
  data, 
  onUpdate, 
  onUpdateItem, 
  onAddItem, 
  onRemoveItem 
}: { 
  data: MerchandiseTemplateProps; 
  onUpdate: (field: string, value: any) => void;
  onUpdateItem: (index: number, field: string, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}) {
  return (
    <>
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Collection Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Artist Name</Label>
            <Input
              value={data.artistName || ''}
              onChange={(e) => onUpdate('artistName', e.target.value)}
              placeholder="Your artist name"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Collection Name</Label>
            <Input
              value={data.collectionName || ''}
              onChange={(e) => onUpdate('collectionName', e.target.value)}
              placeholder="Summer 2024 Collection"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Shop URL</Label>
            <Input
              value={data.shopUrl || ''}
              onChange={(e) => onUpdate('shopUrl', e.target.value)}
              placeholder="https://shop.example.com"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Featured Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs">Featured Image URL</Label>
            <Input
              value={data.featuredImage || ''}
              onChange={(e) => onUpdate('featuredImage', e.target.value)}
              placeholder="https://example.com/collection.jpg"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            placeholder="Tell your fans about this merch drop..."
            className="text-sm resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.items?.map((item, index) => (
            <div key={index} className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Item {index + 1}</span>
                {data.items && data.items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div>
                <Label className="text-xs">Item Name</Label>
                <Input
                  value={item.name}
                  onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                  placeholder="T-Shirt, Hoodie, etc."
                  className="h-7 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Price</Label>
                <Input
                  value={item.price}
                  onChange={(e) => onUpdateItem(index, 'price', e.target.value)}
                  placeholder="$25"
                  className="h-7 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Image URL (optional)</Label>
                <Input
                  value={item.image || ''}
                  onChange={(e) => onUpdateItem(index, 'image', e.target.value)}
                  placeholder="https://example.com/item.jpg"
                  className="h-7 text-sm"
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddItem}
            className="w-full h-8"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Promotions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Promotions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.limitedTime}
              onCheckedChange={(checked) => onUpdate('limitedTime', checked)}
            />
            <Label className="text-xs">Limited time offer</Label>
          </div>
          <div>
            <Label className="text-xs">Discount Code</Label>
            <Input
              value={data.discountCode || ''}
              onChange={(e) => onUpdate('discountCode', e.target.value)}
              placeholder="SAVE20"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Discount Percentage</Label>
            <Input
              value={data.discountPercent || ''}
              onChange={(e) => onUpdate('discountPercent', e.target.value)}
              placeholder="20"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Instagram URL</Label>
            <Input
              value={data.instagramUrl || ''}
              onChange={(e) => onUpdate('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/yourusername"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Website URL</Label>
            <Input
              value={data.websiteUrl || ''}
              onChange={(e) => onUpdate('websiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}