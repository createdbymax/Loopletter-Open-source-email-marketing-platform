'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
interface FileUploadProps {
    label: string;
    accept?: string;
    maxSize?: number;
    currentUrl?: string;
    onUploadComplete: (url: string) => void;
    onRemove?: () => void;
    className?: string;
    description?: string;
}
export function FileUpload({ label, accept = 'image/*', maxSize = 5 * 1024 * 1024, currentUrl, onUploadComplete, onRemove, className = '', description, }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileSelect = async (file: File) => {
        if (file.size > maxSize) {
            toast.error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }
            const result = await response.json();
            onUploadComplete(result.url);
            toast.success('File uploaded successfully!');
        }
        catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Upload failed');
        }
        finally {
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
    const handleRemove = () => {
        if (onRemove) {
            onRemove();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    return (<div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      {currentUrl ? (<div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex-shrink-0">
              <img src={currentUrl} alt="Current logo" className="h-12 w-12 object-contain border rounded" onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
            }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Current logo
              </p>
              <p className="text-sm text-gray-500">
                Click "Change Logo" to upload a new one
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (<>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    Uploading...
                  </>) : (<>
                    <Upload className="w-4 h-4 mr-2"/>
                    Change Logo
                  </>)}
              </Button>
              {onRemove && (<Button type="button" variant="outline" size="sm" onClick={handleRemove} disabled={uploading}>
                  <X className="w-4 h-4"/>
                </Button>)}
            </div>
          </div>
        </div>) : (<div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 text-gray-400">
              {uploading ? (<Loader2 className="w-12 h-12 animate-spin"/>) : (<ImageIcon className="w-12 h-12"/>)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {uploading ? 'Uploading...' : 'Drop your logo here, or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, SVG up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="w-4 h-4 mr-2"/>
              Choose File
            </Button>
          </div>
        </div>)}

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden"/>

      {description && (<p className="text-sm text-gray-600">{description}</p>)}
    </div>);
}
