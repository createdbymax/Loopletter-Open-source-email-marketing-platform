import { NextRequest, NextResponse } from 'next/server';
import { getArtistBySlug } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistSlug = searchParams.get('artist');
  const theme = searchParams.get('theme') || 'light';

  if (!artistSlug) {
    return new NextResponse('Artist slug is required', { status: 400 });
  }

  try {
    const artist = await getArtistBySlug(artistSlug);
    if (!artist) {
      return new NextResponse('Artist not found', { status: 404 });
    }

    // Generate mobile-optimized widget HTML
    const widgetHtml = generateMobileWidgetHtml(artist, theme);

    return new NextResponse(widgetHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Mobile widget error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function generateMobileWidgetHtml(artist: unknown, theme: string) {
  const isDark = theme === 'dark';

  const colors = {
    light: {
      bg: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      button: '#7c3aed',
      buttonHover: '#6d28d9',
      buttonText: '#ffffff',
    },
    dark: {
      bg: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      button: '#7c3aed',
      buttonHover: '#6d28d9',
      buttonText: '#ffffff',
    },
  };

  const currentColors = colors[isDark ? 'dark' : 'light'];

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
      padding: 16px;
    }
    
    .mobile-widget {
      background: ${currentColors.bg};
      border: 1px solid ${currentColors.border};
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .widget-title {
      color: ${currentColors.text};
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .widget-subtitle {
      color: ${currentColors.textSecondary};
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .widget-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .widget-input {
      padding: 14px;
      border: 1px solid ${currentColors.border};
      border-radius: 12px;
      font-size: 16px;
      background: ${currentColors.bg};
      color: ${currentColors.text};
      outline: none;
      transition: border-color 0.2s;
    }
    
    .widget-input:focus {
      border-color: ${currentColors.button};
    }
    
    .widget-button {
      background: ${currentColors.button};
      color: ${currentColors.buttonText};
      border: none;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
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
      border-radius: 12px;
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
      margin-top: 16px;
      font-size: 11px;
      color: ${currentColors.textSecondary};
    }
  </style>
</head>
<body>
  <div class="mobile-widget">
    <h3 class="widget-title">Join ${artist.name}</h3>
    <p class="widget-subtitle">Get exclusive updates</p>
    
    <form class="widget-form" id="subscribeForm">
      <input 
        type="email" 
        class="widget-input" 
        placeholder="your@email.com" 
        required 
        id="emailInput"
      >
      <button type="submit" class="widget-button" id="submitButton">
        Subscribe
      </button>
    </form>
    
    <div id="messageContainer"></div>
    
    <div class="widget-footer">
      Powered by LoopLetter
    </div>
  </div>

  <script>
    (function() {
      const form = document.getElementById('subscribeForm');
      const emailInput = document.getElementById('emailInput');
      const submitButton = document.getElementById('submitButton');
      const messageContainer = document.getElementById('messageContainer');
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        if (!email) return;
        
        submitButton.disabled = true;
        submitButton.innerHTML = 'Subscribing...';
        messageContainer.innerHTML = '';
        
        try {
          const response = await fetch(window.location.origin + '/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              artist_slug: '${artist.slug}',
              source: 'mobile_widget'
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            messageContainer.innerHTML = '<div class="widget-message widget-success">🎉 Welcome! Check your email.</div>';
            form.reset();
          } else {
            messageContainer.innerHTML = '<div class="widget-message widget-error">' + (data.error || 'Something went wrong') + '</div>';
          }
        } catch (error) {
          messageContainer.innerHTML = '<div class="widget-message widget-error">Please try again.</div>';
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