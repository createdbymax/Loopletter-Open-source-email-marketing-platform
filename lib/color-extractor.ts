// Extract dominant colors from album artwork for template theming

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  muted: string;
}

export async function extractColorsFromImage(imageUrl: string): Promise<ColorPalette> {
  // Only run on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return getDefaultPalette();
  }

  try {
    // For now, we'll use a simple approach with predefined color palettes
    // In production, you could use a service like Vibrant.js or an API
    
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = 100;
        canvas.height = 100;
        ctx?.drawImage(img, 0, 0, 100, 100);
        
        try {
          const imageData = ctx?.getImageData(0, 0, 100, 100);
          const colors = analyzeImageData(imageData);
          resolve(colors);
        } catch (_error) {
          // Fallback to default palette if CORS or other issues
          resolve(getDefaultPalette());
        }
      };
      
      img.onerror = () => {
        resolve(getDefaultPalette());
      };
      
      img.src = imageUrl;
    });
  } catch (_error) {
    return getDefaultPalette();
  }
}

function analyzeImageData(imageData: ImageData | undefined): ColorPalette {
  if (!imageData) return getDefaultPalette();
  
  const data = imageData.data;
  const colorCounts: { [key: string]: number } = {};
  
  // Sample every 4th pixel to improve performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue; // Skip transparent pixels
    
    // Group similar colors
    const key = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
    colorCounts[key] = (colorCounts[key] || 0) + 1;
  }
  
  // Get the most common colors
  const sortedColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => color.split(',').map(Number));
  
  if (sortedColors.length === 0) return getDefaultPalette();
  
  const [r, g, b] = sortedColors[0];
  
  return {
    primary: `rgb(${r}, ${g}, ${b})`,
    secondary: `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`,
    accent: `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`,
    text: getBrightness(r, g, b) > 128 ? '#1a1a1a' : '#ffffff',
    background: '#ffffff',
    muted: `rgba(${r}, ${g}, ${b}, 0.1)`
  };
}

function getBrightness(r: number, g: number, b: number): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function getDefaultPalette(): ColorPalette {
  return {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    text: '#1a1a1a',
    background: '#ffffff',
    muted: 'rgba(102, 126, 234, 0.1)'
  };
}

// Predefined palettes for common music genres/moods
export const musicPalettes: { [key: string]: ColorPalette } = {
  electronic: {
    primary: '#00f5ff',
    secondary: '#ff006e',
    accent: '#8338ec',
    text: '#ffffff',
    background: '#0a0a0a',
    muted: 'rgba(0, 245, 255, 0.1)'
  },
  rock: {
    primary: '#ff4757',
    secondary: '#2f3542',
    accent: '#ff6b7a',
    text: '#ffffff',
    background: '#1e1e1e',
    muted: 'rgba(255, 71, 87, 0.1)'
  },
  pop: {
    primary: '#ff9ff3',
    secondary: '#54a0ff',
    accent: '#5f27cd',
    text: '#2f3640',
    background: '#ffffff',
    muted: 'rgba(255, 159, 243, 0.1)'
  },
  hiphop: {
    primary: '#feca57',
    secondary: '#48dbfb',
    accent: '#ff9ff3',
    text: '#2f3640',
    background: '#ffffff',
    muted: 'rgba(254, 202, 87, 0.1)'
  },
  indie: {
    primary: '#26de81',
    secondary: '#fc5c65',
    accent: '#fed330',
    text: '#2f3640',
    background: '#ffffff',
    muted: 'rgba(38, 222, 129, 0.1)'
  }
};