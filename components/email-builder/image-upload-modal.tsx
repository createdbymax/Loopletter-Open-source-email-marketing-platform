'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (url: string, altText?: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onImageSelect }: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadResult, setUploadResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      setImageUrl(result.url);
      setAltText(file.name.split('.')[0]); // Use filename without extension as default alt text
      toast.success('Image uploaded and compressed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl) {
      toast.error('Please provide an image URL or upload an image');
      return;
    }

    onImageSelect(imageUrl, altText);
    handleClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setAltText('');
    setUploadResult(null);
    setUploading(false);
    setDragOver(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  {uploading ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : uploadResult ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <ImageIcon className="w-12 h-12" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uploading 
                      ? 'Uploading and compressing...' 
                      : uploadResult 
                        ? 'Image ready!' 
                        : 'Drop your image here, or click to browse'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WebP up to 10MB (will be compressed automatically)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            {uploadResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <img
                    src={uploadResult.url}
                    alt="Uploaded image"
                    className="h-16 w-16 object-cover border rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Image uploaded successfully
                    </p>
                    <p className="text-sm text-gray-500">
                      Compressed by {uploadResult.compressionRatio}% 
                      ({formatFileSize(uploadResult.originalSize)} → {formatFileSize(uploadResult.compressedSize)})
                    </p>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
          <Input
            id="alt-text"
            placeholder="Describe the image"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>

        {imageUrl && (
          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img
              src={imageUrl}
              alt={altText || 'Preview'}
              className="max-w-full h-auto max-h-32 object-contain border rounded"
              onError={() => toast.error('Failed to load image. Please check the URL.')}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleInsertImage}
            disabled={!imageUrl || uploading}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}