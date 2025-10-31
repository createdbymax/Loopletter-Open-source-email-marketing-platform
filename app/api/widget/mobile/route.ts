import { NextRequest, NextResponse } from 'next/server';
import { getArtistBySlug } from '@/lib/db';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artistSlug = searchParams.get('artist');
        const theme = searchParams.get('theme') || 'dark';
        if (!artistSlug) {
            return new NextResponse('Artist parameter is required', { status: 400 });
        }
        const artist = await getArtistBySlug(artistSlug);
        if (!artist) {
            return new NextResponse('Artist not found', { status: 404 });
        }
        const settings = artist.settings?.subscription_page_settings || {};
        const colors = (settings as any).colors || {
            primary: '#2563eb',
            secondary: '#0891b2',
            accent: '#06b6d4'
        };
        const widgetHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${artist.name} - Subscribe</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: white;
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            padding: 16px;
        }

        /* Background effects */
        .bg-grid {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
            background-size: 15px 15px;
        }

        .widget-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 320px;
        }

        .widget-card {
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(71, 85, 105, 0.3);
            backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 9999px;
            margin-bottom: 12px;
            font-size: 11px;
            color: #93c5fd;
            font-weight: 500;
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            background: #60a5fa;
            border-radius: 50%;
        }

        .title {
            font-size: 18px;
            font-weight: 300;
            margin-bottom: 6px;
            line-height: 1.2;
        }

        .title-gradient {
            background: linear-gradient(to right, ${colors.primary}, ${colors.secondary});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
        }

        .subtitle {
            color: #94a3b8;
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 20px;
        }

        .form {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .label {
            font-size: 12px;
            font-weight: 500;
            color: #cbd5e1;
        }

        .input {
            height: 44px;
            padding: 0 14px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 10px;
            color: white;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
        }

        .input:focus {
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
        }

        .input::placeholder {
            color: #64748b;
        }

        .submit-btn {
            height: 44px;
            background: linear-gradient(to right, ${colors.primary}, ${colors.secondary});
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 25px -5px rgba(37, 99, 235, 0.5);
        }

        .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .success-state {
            text-align: center;
            display: none;
        }

        .success-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary});
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            box-shadow: 0 15px 30px -8px rgba(37, 99, 235, 0.25);
        }

        .success-title {
            font-size: 16px;
            font-weight: 300;
            margin-bottom: 6px;
        }

        .success-message {
            color: #94a3b8;
            font-size: 11px;
            line-height: 1.4;
        }

        .loading {
            display: none;
            align-items: center;
            gap: 6px;
        }

        .spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="bg-grid"></div>
    
    <div class="widget-container">
        <div class="widget-card">
            <div class="header">
                <div class="badge">
                    <div class="badge-dot"></div>
                    Exclusive Access
                </div>
                <h1 class="title">
                    Join ${artist.name}'s
                    <span class="title-gradient">Inner Circle</span>
                </h1>
                <p class="subtitle">
                    Get exclusive updates and early access.
                </p>
            </div>

            <form class="form" id="subscribeForm">
                <div class="input-group">
                    <label class="label" for="name">First Name</label>
                    <input class="input" type="text" id="name" name="name" placeholder="Your name">
                </div>
                
                <div class="input-group">
                    <label class="label" for="email">Email Address</label>
                    <input class="input" type="email" id="email" name="email" placeholder="your@email.com" required>
                </div>

                <div class="error" id="error"></div>

                <button class="submit-btn" type="submit" id="submitBtn">
                    <span id="btnText">Request Access</span>
                    <div class="loading" id="loading">
                        <div class="spinner"></div>
                        <span>Connecting...</span>
                    </div>
                </button>
            </form>

            <div class="success-state" id="successState">
                <div class="success-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <h2 class="success-title">Access Granted!</h2>
                <p class="success-message">
                    Check your email for next steps.
                </p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('subscribeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const form = document.getElementById('subscribeForm');
            const successState = document.getElementById('successState');
            
            const email = document.getElementById('email').value;
            const name = document.getElementById('name').value;
            
            // Show loading state
            btnText.style.display = 'none';
            loading.style.display = 'flex';
            submitBtn.disabled = true;
            error.style.display = 'none';
            
            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        name: name || undefined,
                        artist_slug: '${artistSlug}',
                        source: 'mobile_widget'
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to subscribe');
                }
                
                // Show success state
                form.style.display = 'none';
                successState.style.display = 'block';
                
            } catch (err) {
                // Show error
                error.textContent = err.message;
                error.style.display = 'block';
                
                // Reset button
                btnText.style.display = 'inline';
                loading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`;
        return new NextResponse(widgetHtml, {
            headers: {
                'Content-Type': 'text/html',
                'X-Frame-Options': 'ALLOWALL',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
    catch (error) {
        console.error('Mobile widget error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
