'use client';

export function TemplatePreviewSkeleton() {
  return (
    <div className="w-full h-full min-h-[200px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );
}