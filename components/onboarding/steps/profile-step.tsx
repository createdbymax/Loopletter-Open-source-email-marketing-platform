"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, User, Globe, Palette } from 'lucide-react';
import { Artist } from '@/lib/types';
interface ProfileStepProps {
    artist: Artist;
    onNext: () => void;
    onStepComplete: () => void;
}
export function ProfileStep({ artist, onNext, onStepComplete }: ProfileStepProps) {
    const [formData, setFormData] = useState({
        name: artist.name || '',
        bio: artist.bio || '',
        timezone: artist.settings?.timezone || 'America/New_York',
        website: artist.settings?.social_links?.website || '',
        instagram: artist.settings?.social_links?.instagram || '',
        spotify: artist.settings?.social_links?.spotify || '',
        primaryColor: artist.settings?.brand_colors?.primary || '#3B82F6',
    });
    const [loading, setLoading] = useState(false);
    const timezones = [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
    ];
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/artist/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    bio: formData.bio,
                    settings: {
                        timezone: formData.timezone,
                        brand_colors: {
                            primary: formData.primaryColor,
                            secondary: '#6B7280',
                        },
                        social_links: {
                            website: formData.website,
                            instagram: formData.instagram,
                            spotify: formData.spotify,
                        },
                    },
                }),
            });
            if (response.ok) {
                onStepComplete();
                onNext();
            }
            else {
                throw new Error('Failed to update profile');
            }
        }
        catch (error) {
            console.error('Error updating profile:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (<form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-4">
          <User className="w-4 h-4 text-purple-600"/>
          <span className="text-sm font-medium text-purple-800">Tell us about yourself</span>
        </div>
        <p className="text-gray-600 text-lg">
          Let's personalize your account and set up your artist profile
        </p>
      </div>

      
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <User className="w-5 h-5 text-white"/>
              </div>
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                  Artist/Band Name *
                </Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Your artist or band name" required className="h-12 bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl"/>
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">
                  Bio
                </Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell your fans about yourself and your music..." rows={4} className="bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl resize-none"/>
              </div>

              <div>
                <Label htmlFor="timezone" className="text-sm font-medium text-gray-700 mb-2 block">
                  Timezone
                </Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger className="h-12 bg-white/80 border-gray-200 focus:border-purple-300 focus:ring-purple-200 rounded-xl">
                    <SelectValue placeholder="Select your timezone"/>
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (<SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-white"/>
              </div>
              <h3 className="font-semibold text-gray-900">Social Links</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700 mb-2 block">
                  Website
                </Label>
                <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://yourwebsite.com" className="h-12 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"/>
              </div>

              <div>
                <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 mb-2 block">
                  Instagram
                </Label>
                <Input id="instagram" value={formData.instagram} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))} placeholder="@yourusername" className="h-12 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"/>
              </div>

              <div>
                <Label htmlFor="spotify" className="text-sm font-medium text-gray-700 mb-2 block">
                  Spotify Artist URL
                </Label>
                <Input id="spotify" type="url" value={formData.spotify} onChange={(e) => setFormData(prev => ({ ...prev, spotify: e.target.value }))} placeholder="https://open.spotify.com/artist/..." className="h-12 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200 rounded-xl"/>
              </div>
            </div>
          </div>
        </div>

        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg">
                <Palette className="w-5 h-5 text-white"/>
              </div>
              <h3 className="font-semibold text-gray-900">Brand Colors</h3>
            </div>
            
            <div>
              <Label htmlFor="primaryColor" className="text-sm font-medium text-gray-700 mb-2 block">
                Primary Brand Color
              </Label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input id="primaryColor" type="color" value={formData.primaryColor} onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))} className="w-16 h-16 p-2 border-2 border-gray-200 rounded-xl cursor-pointer"/>
                  <div className="absolute inset-0 rounded-xl border-2 border-white shadow-sm pointer-events-none"></div>
                </div>
                <div className="flex-1">
                  <Input value={formData.primaryColor} onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))} placeholder="#3B82F6" className="h-12 bg-white/80 border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-xl font-mono"/>
                  <p className="text-xs text-gray-500 mt-2">
                    This color will be used in your subscription forms and email templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading || !formData.name.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
            {loading ? (<>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Saving...
              </>) : (<>
                Continue
                <ArrowRight className="w-5 h-5 ml-2"/>
              </>)}
          </Button>
        </div>
      </div>
    </form>);
}
