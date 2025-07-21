import { NextRequest, NextResponse } from 'next/server';
import { getArtistBySlug } from '@/lib/db';
import { Artist } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistSlug = searchParams.get('artist');
  const theme = searchParams.get('theme') || 'light';
  const size = searchParams.get('size') || 'medium';

  if (!artistSlug) {
    return new NextResponse('Artist slug is required', { status: 400 });
  }

  try {
    const artist = await getArtistBySlug(artistSlug);
    if (!artist) {
      return new NextResponse('Artist not found', { status: 404 });
    }

    // Generate widget HTML
    const widgetHtml = generateWidgetHtml(artist, theme, size);

    return new NextResponse(widgetHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Widget error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function generateWidgetHtml(artist: Artist, theme: string, size: string) {
  const isDark = theme === 'dark';
  const isSmall = size === 'small';
  const isMedium = size === 'medium';

  const colors = {
    light: {
      bg: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      button: '#7c3aed',
      buttonHover: '#6d28d9',
      buttonText: '#ffffff',
      accent: '#f3f4f6',
    },
    dark: {
      bg: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      button: '#7c3aed',
      buttonHover: '#6d28d9',
      buttonText: '#ffffff',
      accent: '#374151',
    },
  };

  const currentColors = colors[isDark ? 'dark' : 'light'];

  const padding = isSmall ? '16px' : isMedium ? '24px' : '32px';
  const fontSize = isSmall ? '14px' : isMedium ? '16px' : '18px';
  const titleSize = isSmall ? '18px' : isMedium ? '20px' : '24px';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Subscribe to ${artist.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
    }
    
    .widget-container {
      background: ${currentColors.bg};
      border: 1px solid ${currentColors.border};
      border-radius: 12px;
      padding: ${padding};
      max-width: 400px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .widget-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .widget-title {
      color: ${currentColors.text};
      font-size: ${titleSize};
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .widget-subtitle {
      color: ${currentColors.textSecondary};
      font-size: ${fontSize};
    }
    
    .widget-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .widget-input {
      padding: 12px;
      border: 1px solid ${currentColors.border};
      border-radius: 8px;
      font-size: ${fontSize};
      background: ${currentColors.bg};
      color: ${currentColors.text};
      outline: none;
      transition: border-color 0.2s;
    }
    
    .widget-input:focus {
      border-color: ${currentColors.button};
    }
    
    .widget-input::placeholder {
      color: ${currentColors.textSecondary};
    }
    
    .widget-button {
      background: ${currentColors.button};
      color: ${currentColors.buttonText};
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: ${fontSize};
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .widget-button:hover {
      background: ${currentColors.buttonHover};
    }
    
    .widget-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .widget-message {
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 12px;
    }
    
    .widget-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    
    .widget-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    
    .widget-footer {
      text-align: center;
      margin-top: 16px;
      font-size: 12px;
      color: ${currentColors.textSecondary};
    }
    
    .widget-loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid ${currentColors.buttonText};
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="widget-container">
    <div class="widget-header">
      <h3 class="widget-title">Join ${artist.name}'s List</h3>
      <p class="widget-subtitle">Get exclusive updates and early access</p>
    </div>
    
    <form class="widget-form" id="subscribeForm">
      <input 
        type="email" 
        class="widget-input" 
        placeholder="your@email.com" 
        required 
        id="emailInput"
      >
      <input 
        type="text" 
        class="widget-input" 
        placeholder="First name (optional)" 
        id="nameInput"
      >
      <button type="submit" class="widget-button" id="submitButton">
        Subscribe
      </button>
    </form>
    
    <div id="messageContainer"></div>
    
    <div class="widget-footer">
      Powered by Loopletter
    </div>
  </div>

  <script>
    (function() {
      const form = document.getElementById('subscribeForm');
      const emailInput = document.getElementById('emailInput');
      const nameInput = document.getElementById('nameInput');
      const submitButton = document.getElementById('submitButton');
      const messageContainer = document.getElementById('messageContainer');
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const name = nameInput.value.trim();
        
        if (!email) return;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="widget-loading"></span> Subscribing...';
        messageContainer.innerHTML = '';
        
        try {
          const response = await fetch(window.location.origin + '/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              name: name || undefined,
              artist_slug: '${artist.slug}',
              source: 'widget'
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            messageContainer.innerHTML = '<div class="widget-message widget-success">🎉 Welcome to the family! Check your email for updates.</div>';
            form.reset();
          } else {
            messageContainer.innerHTML = '<div class="widget-message widget-error">' + (data.error || 'Something went wrong') + '</div>';
          }
        } catch (error) {
          messageContainer.innerHTML = '<div class="widget-message widget-error">Network error. Please try again.</div>';
        } finally {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Subscribe';
        }
      });
    })();
  </script>
</body>
</html>`;
}