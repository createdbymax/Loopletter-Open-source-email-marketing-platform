"use client";
import { useState } from "react";
import Image from "next/image";
interface ArtistLogoProps {
    logoUrl?: string;
    artistName: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    showFallback?: boolean;
    fallbackText?: string;
}
const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
};
const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
};
export function ArtistLogo({ logoUrl, artistName, size = "md", className = "", showFallback = true, fallbackText, }: ArtistLogoProps) {
    const [imageError, setImageError] = useState(false);
    if (!logoUrl || imageError) {
        if (!showFallback)
            return null;
        const initials = artistName
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
        return (<div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold ${textSizeClasses[size]} shadow-sm`} title={artistName}>
        {fallbackText || initials}
      </div>);
    }
    return (<img src={logoUrl} alt={`${artistName} logo`} className={`${sizeClasses[size]} ${className} object-contain rounded-lg`} onError={() => setImageError(true)} title={artistName}/>);
}
