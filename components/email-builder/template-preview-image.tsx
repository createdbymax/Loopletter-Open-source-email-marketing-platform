'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface TemplatePreviewImageProps {
  templateId: string;
}

// Map of template IDs to their preview image paths
const templatePreviews: Record<string, string> = {
  'blank': '/images/templates/blank-preview.png',
  'music-release': '/images/templates/music-release-preview.png',
  'show-announcement': '/images/templates/show-announcement-preview.png',
  'merchandise': '/images/templates/merchandise-preview.png',
  'newsletter': '/images/templates/newsletter-preview.png',
};

export function TemplatePreviewImage({ templateId }: TemplatePreviewImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Get the preview image path for the template
  const previewPath = templatePreviews[templateId] || '/images/templates/default-preview.png';
  
  // Reset loading and error states when template changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
  }, [templateId]);

  return (
    <div className="relative w-full h-full min-h-[200px] bg-white rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200"></div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">Preview not available</p>
        </div>
      ) : (
        <Image
          src={previewPath}
          alt={`Preview of ${templateId} template`}
          fill
          className="object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
}