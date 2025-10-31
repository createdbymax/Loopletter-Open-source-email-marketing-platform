'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import { ImageUploadModal } from './image-upload-modal';
import type { Editor } from '@tiptap/core';
interface CustomImageButtonProps {
    editor: Editor | null;
}
export function CustomImageButton({ editor }: CustomImageButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleImageSelect = (url: string, alt?: string) => {
        if (!editor)
            return;
        editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    };
    if (!editor)
        return null;
    return (<>
      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <ImageIcon className="w-4 h-4"/>
        Upload Image
      </Button>

      <ImageUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onImageSelect={handleImageSelect}/>
    </>);
}
