"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Music, ExternalLink, Loader2, CheckCircle, AlertCircle, Eye, ArrowRight, Sparkles, Edit3, Link, Play } from "lucide-react";
import type { MusicReleaseData } from "@/lib/spotify";
import type { PlatformLink } from "@/lib/music-platforms";
import { usePersistentInput } from "@/hooks/use-persistent-state";
interface EditablePlatformLink extends PlatformLink {
    isEditing?: boolean;
}
interface SpotifyTemplateGeneratorProps {
    onTemplateGenerated?: (templateData: {
        htmlContent: string;
        mailyJson: any;
        releaseData: MusicReleaseData;
        platformLinks: PlatformLink[];
        colorPalette: any;
    }) => void;
}
export function SpotifyTemplateGenerator({ onTemplateGenerated }: SpotifyTemplateGeneratorProps) {
    const spotifyUrlInput = usePersistentInput('spotify-template-url');
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<{
        releaseData: MusicReleaseData;
        platformLinks: PlatformLink[];
        previewHtml: string;
    } | null>(null);
    const [editablePlatforms, setEditablePlatforms] = useState<EditablePlatformLink[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const handlePreview = async () => {
        if (!spotifyUrlInput.value.trim()) {
            setError("Please enter a Spotify URL");
            return;
        }
        setLoading(true);
        setError("");
        setPreviewData(null);
        try {
            const response = await fetch(`/api/spotify/generate-template?url=${encodeURIComponent(spotifyUrlInput.value)}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch Spotify data');
            }
            setPreviewData(data);
            setEditablePlatforms(data.platformLinks);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    const handleUseTemplate = async () => {
        if (!previewData) {
            setError("Please preview the template first");
            return;
        }
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await fetch('/api/spotify/generate-template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spotifyUrl: spotifyUrlInput.value,
                    platformLinks: editablePlatforms.map(({ isEditing, ...platform }) => platform),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate template');
            }
            console.log('Spotify template data:', data);
            onTemplateGenerated?.(data);
            setSuccess("Template generated! Opening in email editor...");
            setTimeout(() => {
                spotifyUrlInput.clearValue();
                setPreviewData(null);
                setSuccess("");
            }, 1000);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    const isValidSpotifyUrl = (url: string) => {
        return url.includes('spotify.com') || url.includes('spotify:');
    };
    return (<div className="max-w-4xl mx-auto space-y-6">
      
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl">
          <Music className="w-6 h-6 text-white"/>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Generate from Spotify</h2>
          <p className="text-sm text-slate-600">
            Transform any Spotify track or album into a professional email campaign
          </p>
        </div>
      </div>

      
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="spotify-url" className="text-sm font-medium text-slate-900">
                Spotify URL
              </Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Music className="h-4 w-4 text-slate-400"/>
                </div>
                <Input id="spotify-url" value={spotifyUrlInput.value} onChange={spotifyUrlInput.onChange} placeholder="https://open.spotify.com/track/..." className={`pl-10 h-10 text-sm ${!isValidSpotifyUrl(spotifyUrlInput.value) && spotifyUrlInput.value
            ? "border-red-300 focus:border-red-500"
            : "border-slate-300 focus:border-slate-900"}`}/>
              </div>
              {spotifyUrlInput.value && !isValidSpotifyUrl(spotifyUrlInput.value) && (<div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4"/>
                  <p className="text-xs">Please enter a valid Spotify URL</p>
                </div>)}
            </div>
            
            <Button type="button" onClick={handlePreview} disabled={loading || !spotifyUrlInput.value.trim()} className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium">
              {loading ? (<>
                  <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                  Analyzing...
                </>) : (<>
                  <Eye className="w-4 h-4 mr-2"/>
                  Preview Template
                </>)}
            </Button>
          </div>



          {error && (<div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-medium text-red-900">Unable to process Spotify link</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>)}

          {success && (<div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"/>
              <div>
                <p className="text-sm font-medium text-green-900">Template Generated Successfully!</p>
                <p className="text-xs text-green-700 mt-1">{success}</p>
              </div>
            </div>)}
        </CardContent>
      </Card>

      {previewData && (<div className="space-y-6">
          
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative">
                  <img src={previewData.releaseData.artworkUrl} alt="Album artwork" className="w-20 h-20 rounded-lg shadow-sm"/>
                  <div className="absolute inset-0 bg-black/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white"/>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {previewData.releaseData.type === 'track' ? 'Single' : 'Album'}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(previewData.releaseData.releaseDate).getFullYear()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                      {previewData.releaseData.title}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      by {previewData.releaseData.artist}
                    </p>
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    Released {new Date(previewData.releaseData.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-slate-600"/>
                  <h4 className="font-medium text-slate-900">Platform Links</h4>
                  <Badge variant="outline" className="text-xs">
                    {editablePlatforms.length + 1} platforms
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      ♪
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Spotify</p>
                      <p className="text-xs text-green-700 truncate">{previewData.releaseData.spotifyUrl}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Original</Badge>
                  </div>

                  
                  {editablePlatforms.map((platform, index) => (<div key={index} className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: platform.color }}>
                          {platform.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{platform.name}</p>
                          <p className="text-xs text-slate-500">Auto-generated</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                    const updatedPlatforms = [...editablePlatforms];
                    updatedPlatforms[index] = {
                        ...updatedPlatforms[index],
                        isEditing: !updatedPlatforms[index].isEditing
                    };
                    setEditablePlatforms(updatedPlatforms);
                }}>
                          <Edit3 className="w-3 h-3"/>
                        </Button>
                      </div>
                      
                      {platform.isEditing && (<div className="ml-11 space-y-2">
                          <Label htmlFor={`platform-${index}`} className="text-xs text-slate-600">
                            Edit {platform.name} URL
                          </Label>
                          <div className="flex gap-2">
                            <Input id={`platform-${index}`} value={platform.url} onChange={(e) => {
                        const updatedPlatforms = [...editablePlatforms];
                        updatedPlatforms[index] = {
                            ...updatedPlatforms[index],
                            url: e.target.value
                        };
                        setEditablePlatforms(updatedPlatforms);
                    }} className="text-xs h-8" placeholder={`Enter ${platform.name} URL...`}/>
                            <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => {
                        const updatedPlatforms = [...editablePlatforms];
                        updatedPlatforms[index] = {
                            ...updatedPlatforms[index],
                            isEditing: false
                        };
                        setEditablePlatforms(updatedPlatforms);
                    }}>
                              Save
                            </Button>
                          </div>
                        </div>)}
                    </div>))}
                </div>
              </div>
            </CardContent>
          </Card>

          
          <div className="flex justify-center pt-2">
            <Button type="button" onClick={handleUseTemplate} disabled={loading || !previewData} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium">
              {loading ? (<>
                  <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                  Creating Template...
                </>) : (<>
                  <ArrowRight className="w-4 h-4 mr-2"/>
                  Create Email Campaign
                </>)}
            </Button>
          </div>
        </div>)}
    </div>);
}
