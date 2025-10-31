import { NextRequest, NextResponse } from 'next/server';
import { getArtistBySlug } from '@/lib/db';
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artistSlug = searchParams.get('artist');
        const theme = searchParams.get('theme') || 'light';
        const size = searchParams.get('size') || 'medium';
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
        const sizeConfig = {
            small: { width: '300px', height: '350px', padding: '16px', fontSize: '14px' },
            medium: { width: '400px', height: '450px', padding: '24px', fontSize: '16px' },
            large: { width: '500px', height: '550px', padding: '32px', fontSize: '18px' }
        };
        const config = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.medium;
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
        }

        /* Background effects */
        .bg-grid {
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }

        .bg-glow-1 {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 200px;
            background: rgba(59, 130, 246, 0.05);
            border-radius: 50%;
            filter: blur(60px);
        }

        .bg-glow-2 {
            position: absolute;
            bottom: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(6, 182, 212, 0.05);
            border-radius: 50%;
            filter: blur(60px);
        }

        .widget-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: ${config.width};
            padding: ${config.padding};
        }

        .widget-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(71, 85, 105, 0.3);
            backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: ${config.padding};
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .header {
            text-align: center;
            margin-bottom: 24px;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 9999px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #93c5fd;
            font-weight: 500;
        }

        .badge-dot {
            width: 8px;
            height: 8px;
            background: #60a5fa;
            border-radius: 50%;
        }

        .title {
            font-size: ${config.fontSize === '18px' ? '24px' : config.fontSize === '16px' ? '20px' : '18px'};
            font-weight: 300;
            margin-bottom: 8px;
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
            font-size: ${config.fontSize === '18px' ? '16px' : config.fontSize === '16px' ? '14px' : '12px'};
            line-height: 1.5;
            margin-bottom: 24px;
        }

        .form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .label {
            font-size: 14px;
            font-weight: 500;
            color: #cbd5e1;
        }

        .input {
            height: 48px;
            padding: 0 16px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(71, 85, 105, 0.5);
            border-radius: 12px;
            color: white;
            font-size: ${config.fontSize};
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
            height: 48px;
            background: linear-gradient(to right, ${colors.primary}, ${colors.secondary});
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            font-size: ${config.fontSize};
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.5);
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
            width: 64px;
            height: 64px;
            background: linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary});
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.25);
        }

        .success-title {
            font-size: ${config.fontSize === '18px' ? '20px' : config.fontSize === '16px' ? '18px' : '16px'};
            font-weight: 300;
            margin-bottom: 8px;
        }

        .success-message {
            color: #94a3b8;
            font-size: ${config.fontSize === '18px' ? '14px' : config.fontSize === '16px' ? '12px' : '11px'};
            line-height: 1.5;
        }

        .loading {
            display: none;
            align-items: center;
            gap: 8px;
        }

        .spinner {
            width: 20px;
            height: 20px;
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
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="bg-grid"></div>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    
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
                    Get exclusive access to unreleased tracks, behind-the-scenes content, and priority event access.
                </p>
            </div>

            <form class="form" id="subscribeForm">
                <div class="input-group">
                    <label class="label" for="name">First Name</label>
                    <input class="input" type="text" id="name" name="name" placeholder="Enter your first name">
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </div>
                <h2 class="success-title">Access Granted!</h2>
                <p class="success-message">
                    You're now part of the exclusive network. Check your email for next steps.
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
                        source: 'widget'
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
        console.error('Widget error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
