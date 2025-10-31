'use client';
import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Heading1, Heading2, Text, Image, Columns, GripVertical, Trash2, Plus, Settings } from 'lucide-react';
export interface EmailTemplate {
    id: string;
    name: string;
    thumbnail: string;
    blocks: EmailBlock[];
}
export type BlockType = 'heading1' | 'heading2' | 'paragraph' | 'image' | 'button' | 'divider' | 'spacer' | 'columns';
export interface EmailBlock {
    id: string;
    type: BlockType;
    content: string;
    settings?: Record<string, any>;
}
const blockTypes: {
    type: BlockType;
    icon: React.ReactNode;
    label: string;
}[] = [
    { type: 'heading1', icon: <Heading1 className="h-5 w-5"/>, label: 'Heading 1' },
    { type: 'heading2', icon: <Heading2 className="h-5 w-5"/>, label: 'Heading 2' },
    { type: 'paragraph', icon: <Text className="h-5 w-5"/>, label: 'Paragraph' },
    { type: 'image', icon: <Image className="h-5 w-5"/>, label: 'Image' },
    { type: 'button', icon: <Button className="h-5 w-5"/>, label: 'Button' },
    { type: 'columns', icon: <Columns className="h-5 w-5"/>, label: 'Columns' },
];
const getDefaultContent = (type: BlockType): string => {
    switch (type) {
        case 'heading1':
            return 'Main Heading';
        case 'heading2':
            return 'Subheading';
        case 'paragraph':
            return 'Enter your text here. This is a paragraph block where you can add your content.';
        case 'image':
            return 'https://via.placeholder.com/600x200';
        case 'button':
            return 'Click Me';
        case 'divider':
            return '';
        case 'spacer':
            return '';
        case 'columns':
            return 'Column content';
        default:
            return '';
    }
};
function SortableBlock({ block, onRemove, onEdit }: {
    block: EmailBlock;
    onRemove: (id: string) => void;
    onEdit: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, } = useSortable({ id: block.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const renderBlockContent = () => {
        switch (block.type) {
            case 'heading1':
                return <h1 className="text-2xl font-bold">{block.content}</h1>;
            case 'heading2':
                return <h2 className="text-xl font-semibold">{block.content}</h2>;
            case 'paragraph':
                return <p>{block.content}</p>;
            case 'image':
                return <img src={block.content} alt="Email content" className="w-full h-auto"/>;
            case 'button':
                return (<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            {block.content}
          </button>);
            case 'divider':
                return <hr className="my-4 border-t border-gray-300"/>;
            case 'spacer':
                return <div className="h-8"></div>;
            case 'columns':
                return (<div className="grid grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-300 p-4">Column 1</div>
            <div className="border border-dashed border-gray-300 p-4">Column 2</div>
          </div>);
            default:
                return null;
        }
    };
    return (<div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-md mb-4 group">
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <button {...attributes} {...listeners} className="cursor-grab p-1 mr-2 text-gray-500 hover:text-gray-700">
            <GripVertical className="h-4 w-4"/>
          </button>
          <span className="text-sm font-medium capitalize">{block.type}</span>
        </div>
        <div className="flex items-center">
          <button onClick={() => onEdit(block.id)} className="p-1 text-gray-500 hover:text-gray-700">
            <Settings className="h-4 w-4"/>
          </button>
          <button onClick={() => onRemove(block.id)} className="p-1 text-gray-500 hover:text-red-500">
            <Trash2 className="h-4 w-4"/>
          </button>
        </div>
      </div>
      <div className="p-4">
        {renderBlockContent()}
      </div>
    </div>);
}
export function VisualEmailBuilder({ initialBlocks = [], onChange, }: {
    initialBlocks?: EmailBlock[];
    onChange?: (blocks: EmailBlock[]) => void;
}) {
    const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newBlocks = arrayMove(items, oldIndex, newIndex);
                if (onChange) {
                    onChange(newBlocks);
                }
                return newBlocks;
            });
        }
        setActiveId(null);
    };
    const addBlock = (type: BlockType) => {
        const newBlock: EmailBlock = {
            id: `block-${Date.now()}`,
            type,
            content: getDefaultContent(type),
        };
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        if (onChange) {
            onChange(newBlocks);
        }
    };
    const removeBlock = (id: string) => {
        const newBlocks = blocks.filter((block) => block.id !== id);
        setBlocks(newBlocks);
        if (onChange) {
            onChange(newBlocks);
        }
    };
    const editBlock = (id: string) => {
        console.log('Edit block:', id);
    };
    return (<div className="flex h-full">
      
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-4">CONTENT BLOCKS</h2>
        <div className="space-y-2">
          {blockTypes.map((blockType) => (<button key={blockType.type} className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 text-left" onClick={() => addBlock(blockType.type)}>
              <div className="mr-2 text-gray-600">{blockType.icon}</div>
              <span>{blockType.label}</span>
            </button>))}
        </div>
      </div>
      
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[600px] mx-auto bg-white border border-gray-200 rounded-md p-6 min-h-[600px]">
          {blocks.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <Plus className="h-12 w-12 mb-4"/>
              <h3 className="text-lg font-medium mb-2">Add content blocks</h3>
              <p className="max-w-xs">
                Select content blocks from the sidebar to start building your email.
              </p>
            </div>) : (<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (<SortableBlock key={block.id} block={block} onRemove={removeBlock} onEdit={editBlock}/>))}
              </SortableContext>
            </DndContext>)}
        </div>
      </div>
    </div>);
}
