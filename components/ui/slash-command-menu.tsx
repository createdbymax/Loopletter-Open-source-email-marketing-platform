"use client";
import { useState, useEffect, useRef } from "react";
import { Type, Image, Heading1, Heading2, Heading3, List, ListOrdered, MousePointer, Minus, Code2, Youtube, Quote, Rows2, SquareCode, Radio, UserMinus, Variable, } from "lucide-react";
interface SlashCommand {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: (editor: HTMLTextAreaElement) => void;
}
interface SlashCommandMenuProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onInsert: (content: string) => void;
}
const XIcon = () => (<svg className="invert dark:invert-0" fill="currentColor" height="20" viewBox="0 0 50 50" width="20" xmlns="http://www.w3.org/2000/svg">
    <polygon points="21.26,26.59 22.66,28.64 9.41,44 6.23,44"/>
    <polygon points="42.2,6 28.01,22.45 26.6,20.4 39.03,6"/>
    <path d="M16.881,8l23.322,34H33.04L9.717,8H16.881 M17.934,6H5.92l26.066,38H44L17.934,6L17.934,6z"/>
  </svg>);
export function SlashCommandMenu({ textareaRef, onInsert, }: SlashCommandMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [slashPosition, setSlashPosition] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const commands: SlashCommand[] = [
        {
            id: "text",
            label: "Text",
            icon: <Type className="w-5 h-5"/>,
            action: () => onInsert("\n\nYour text here...\n\n"),
        },
        {
            id: "image",
            label: "Image",
            icon: <Image className="w-5 h-5"/>,
            action: () => onInsert("\n\n[Image: Add your image description here]\n\n"),
        },
        {
            id: "heading1",
            label: "Heading 1",
            icon: <Heading1 className="w-5 h-5"/>,
            action: () => onInsert("\n\n# Your Heading Here\n\n"),
        },
        {
            id: "heading2",
            label: "Heading 2",
            icon: <Heading2 className="w-5 h-5"/>,
            action: () => onInsert("\n\n## Your Heading Here\n\n"),
        },
        {
            id: "heading3",
            label: "Heading 3",
            icon: <Heading3 className="w-5 h-5"/>,
            action: () => onInsert("\n\n### Your Heading Here\n\n"),
        },
        {
            id: "bullet-list",
            label: "Bullet List",
            icon: <List className="w-5 h-5"/>,
            action: () => onInsert("\n\n• First item\n• Second item\n• Third item\n\n"),
        },
        {
            id: "numbered-list",
            label: "Numbered List",
            icon: <ListOrdered className="w-5 h-5"/>,
            action: () => onInsert("\n\n1. First item\n2. Second item\n3. Third item\n\n"),
        },
        {
            id: "button",
            label: "Button",
            icon: <MousePointer className="w-5 h-5"/>,
            action: () => onInsert("\n\n[BUTTON: Your Call-to-Action Text | https://your-link.com]\n\n"),
        },
        {
            id: "divider",
            label: "Divider",
            icon: <Minus className="w-5 h-5"/>,
            action: () => onInsert("\n\n---\n\n"),
        },
        {
            id: "html",
            label: "HTML",
            icon: <Code2 className="w-5 h-5"/>,
            action: () => onInsert("\n\n<div>\n  <!-- Your HTML content here -->\n</div>\n\n"),
        },
        {
            id: "youtube",
            label: "YouTube",
            icon: <Youtube className="w-5 h-5"/>,
            action: () => onInsert("\n\n[YOUTUBE: https://youtube.com/watch?v=YOUR_VIDEO_ID]\n\n"),
        },
        {
            id: "twitter",
            label: "X (former Twitter)",
            icon: <XIcon />,
            action: () => onInsert("\n\n[TWITTER: https://twitter.com/username/status/tweet_id]\n\n"),
        },
        {
            id: "quote",
            label: "Quote",
            icon: <Quote className="w-5 h-5"/>,
            action: () => onInsert('\n\n> "Your inspiring quote goes here"\n> — Author Name\n\n'),
        },
        {
            id: "section",
            label: "Section",
            icon: <Rows2 className="w-5 h-5"/>,
            action: () => onInsert("\n\n=== SECTION BREAK ===\n\n"),
        },
        {
            id: "code",
            label: "Code",
            icon: <SquareCode className="w-5 h-5"/>,
            action: () => onInsert("\n\n```\nYour code here\n```\n\n"),
        },
        {
            id: "social-links",
            label: "Social Links",
            icon: <Radio className="w-5 h-5"/>,
            action: () => onInsert("\n\n[SOCIAL LINKS]\nInstagram: @yourusername\nTwitter: @yourusername\nWebsite: https://yourwebsite.com\n\n"),
        },
        {
            id: "unsubscribe",
            label: "Unsubscribe Footer",
            icon: <UserMinus className="w-5 h-5"/>,
            action: () => onInsert("\n\n---\nDon't want to receive these emails? [Unsubscribe here]\n\n"),
        },
        {
            id: "variable",
            label: "Variable",
            icon: <Variable className="w-5 h-5"/>,
            action: () => onInsert("{{FIRST_NAME}}"),
        },
    ];
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible)
                return;
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % commands.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
                    break;
                case "Enter":
                    e.preventDefault();
                    executeCommand(commands[selectedIndex]);
                    break;
                case "Escape":
                    e.preventDefault();
                    hideMenu();
                    break;
            }
        };
        const handleInput = (e: Event) => {
            const target = e.target as HTMLTextAreaElement;
            const cursorPosition = target.selectionStart;
            const textBeforeCursor = target.value.substring(0, cursorPosition);
            const lastSlashIndex = textBeforeCursor.lastIndexOf("/");
            const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
            if (lastSlashIndex !== -1 &&
                (lastSlashIndex === 0 ||
                    /\s/.test(textBeforeCursor[lastSlashIndex - 1])) &&
                !textAfterSlash.includes(" ") &&
                !textAfterSlash.includes("\n")) {
                setSlashPosition(lastSlashIndex);
                showMenu(target, cursorPosition);
            }
            else {
                hideMenu();
            }
        };
        textarea.addEventListener("keydown", handleKeyDown);
        textarea.addEventListener("input", handleInput);
        return () => {
            textarea.removeEventListener("keydown", handleKeyDown);
            textarea.removeEventListener("input", handleInput);
        };
    }, [isVisible, selectedIndex, commands]);
    const showMenu = (textarea: HTMLTextAreaElement, cursorPosition: number) => {
        const rect = textarea.getBoundingClientRect();
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const currentColumn = lines[lines.length - 1].length;
        const lineHeight = 24;
        const charWidth = 8;
        setPosition({
            x: rect.left + currentColumn * charWidth,
            y: rect.top + currentLine * lineHeight + lineHeight + 5,
        });
        setIsVisible(true);
        setSelectedIndex(0);
    };
    const hideMenu = () => {
        setIsVisible(false);
        setSelectedIndex(0);
    };
    const executeCommand = (command: SlashCommand) => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        const currentValue = textarea.value;
        const beforeSlash = currentValue.substring(0, slashPosition);
        const afterCursor = currentValue.substring(textarea.selectionStart);
        textarea.value = beforeSlash + afterCursor;
        textarea.selectionStart = textarea.selectionEnd = slashPosition;
        command.action(textarea);
        hideMenu();
        textarea.focus();
    };
    if (!isVisible)
        return null;
    return (<div ref={menuRef} className="fixed z-50 h-auto max-h-[330px] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto bg-white rounded-2xl border border-gray-200 py-1 shadow-lg flex flex-col gap-1" style={{
            left: Math.min(position.x, window.innerWidth - 280),
            top: position.y,
        }}>
      {commands.map((command, index) => (<button key={command.id} className={`flex items-center gap-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:bg-gray-100 focus-visible:text-gray-900 rounded-xl px-2 text-sm focus-visible:outline-none mx-1 min-h-8 ${index === selectedIndex ? "bg-gray-100 text-gray-900" : ""}`} onClick={() => executeCommand(command)} onMouseEnter={() => setSelectedIndex(index)}>
          <div className="flex h-9 w-5 items-center justify-center rounded-md">
            {command.icon}
          </div>
          <div>
            <p className="font-medium">{command.label}</p>
          </div>
        </button>))}
    </div>);
}
