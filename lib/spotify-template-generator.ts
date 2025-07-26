// Generate email templates from Spotify data

import { spotifyAPI, type MusicReleaseData } from './spotify';
import { musicLinkService, type PlatformLink } from './music-platforms';
import { extractColorsFromImage, type ColorPalette } from './color-extractor';


export interface SpotifyTemplateData {
  releaseData: MusicReleaseData;
  platformLinks: PlatformLink[];
  generatedHtml: string;
  mailyJson: any;
  colorPalette?: ColorPalette;
}

export class SpotifyTemplateGenerator {
  async generateFromSpotifyUrl(spotifyUrl: string, customPlatformLinks?: PlatformLink[]): Promise<SpotifyTemplateData> {
    // Fetch release data from Spotify
    const releaseData = await spotifyAPI.getMusicReleaseData(spotifyUrl);

    // Use custom platform links if provided, otherwise generate them
    const platformLinks = customPlatformLinks || await musicLinkService.generatePlatformLinks(
      releaseData.isrc,
      releaseData.upc,
      releaseData.artist,
      releaseData.title,
      releaseData.spotifyUrl
    );

    // Extract colors from artwork (will return default palette on server-side)
    let colorPalette: ColorPalette | undefined;
    try {
      colorPalette = await extractColorsFromImage(releaseData.artworkUrl);
    } catch (error) {
      console.warn('Could not extract colors from artwork:', error);
    }

    // Generate both HTML and Maily.to JSON templates
    const generatedHtml = this.generateHtmlTemplate(releaseData, platformLinks, colorPalette);
    const mailyJson = this.generateMailyTemplate(releaseData, platformLinks, colorPalette);

    return {
      releaseData,
      platformLinks,
      generatedHtml,
      mailyJson,
      colorPalette
    };
  }

  private generateMailyTemplate(releaseData: MusicReleaseData, _platformLinks: PlatformLink[], colorPalette?: ColorPalette): any {
    const isTrack = releaseData.type === 'track';
    const releaseType = isTrack ? 'Single' : 'Album';
    const primaryColor = colorPalette?.primary || "#000000";
    const accentColor = colorPalette?.accent || "#ff6b6b";

    // Generate uniform platform buttons for Maily.to format
    const platformButtons = _platformLinks.map(platform => ({
      type: "button",
      attrs: {
        text: `▶ PLAY ON ${platform.name.toUpperCase()}`,
        url: platform.url,
        alignment: "center",
        variant: "filled",
        borderRadius: "lg",
        buttonColor: "#2a2a2a",
        textColor: "#ffffff",
        size: "lg"
      }
    }));

    return {
      type: "doc",
      content: [
        // Hero section with dramatic styling
        {
          type: "section",
          attrs: {
            backgroundColor: primaryColor,
            padding: "xl"
          },
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.8)"
              },
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: `${releaseType.toUpperCase()} • OUT NOW`
                }
              ]
            },
            {
              type: "spacer",
              attrs: {
                height: "sm"
              }
            },
            {
              type: "heading",
              attrs: {
                textAlign: "center",
                level: 1,
                color: "#ffffff"
              },
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: releaseData.title
                }
              ]
            },
            {
              type: "heading",
              attrs: {
                textAlign: "center",
                level: 2,
                color: "rgba(255, 255, 255, 0.9)"
              },
              content: [
                {
                  type: "text",
                  text: releaseData.artist
                }
              ]
            },
            {
              type: "spacer",
              attrs: {
                height: "md"
              }
            },
            {
              type: "button",
              attrs: {
                text: "▶ Play on Spotify",
                url: releaseData.spotifyUrl,
                alignment: "center",
                variant: "filled",
                borderRadius: "xl",
                buttonColor: "#1DB954",
                textColor: "#ffffff",
                size: "lg"
              }
            }
          ]
        },

        // Large spacer
        {
          type: "spacer",
          attrs: {
            height: "xl"
          }
        },

        // Album artwork - premium presentation
        {
          type: "image",
          attrs: {
            src: releaseData.artworkUrl,
            alt: `${releaseData.title} artwork`,
            alignment: "center",
            width: 320,
            height: 320,
            borderRadius: "xl"
          }
        },

        // Spacer
        {
          type: "spacer",
          attrs: {
            height: "lg"
          }
        },

        // Release info with premium styling
        {
          type: "section",
          attrs: {
            backgroundColor: "#f8f9fa",
            padding: "md",
            borderRadius: "lg"
          },
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: "center",
                color: "#666666"
              },
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: `${releaseType} • ${new Date(releaseData.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`
                }
              ]
            }
          ]
        },

        // Large spacer
        {
          type: "spacer",
          attrs: {
            height: "xl"
          }
        },

        // Streaming platforms header
        {
          type: "heading",
          attrs: {
            textAlign: "center",
            level: 2,
            color: "#000000"
          },
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Stream Everywhere"
            }
          ]
        },

        {
          type: "paragraph",
          attrs: {
            textAlign: "center",
            color: "#666666"
          },
          content: [
            {
              type: "text",
              text: "Available on all major platforms"
            }
          ]
        },

        // Spacer
        {
          type: "spacer",
          attrs: {
            height: "lg"
          }
        },

        // Platform buttons with consistent styling
        ...platformButtons.reduce((acc, button, index) => {
          acc.push(button);
          if (index < platformButtons.length - 1) {
            acc.push({
              type: "spacer",
              attrs: {
                height: "xs"
              }
            });
          }
          return acc;
        }, [] as any[]),

        // Large spacer
        {
          type: "spacer",
          attrs: {
            height: "xl"
          }
        },

        // Social sharing section
        {
          type: "section",
          attrs: {
            backgroundColor: accentColor,
            padding: "lg",
            borderRadius: "lg"
          },
          content: [
            {
              type: "heading",
              attrs: {
                textAlign: "center",
                level: 3,
                color: "#ffffff"
              },
              content: [
                {
                  type: "text",
                  marks: [{ type: "bold" }],
                  text: "Share the Vibe"
                }
              ]
            },
            {
              type: "paragraph",
              attrs: {
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.9)"
              },
              content: [
                {
                  type: "text",
                  text: "Love what you hear? Help us reach more music lovers by sharing this track with your friends."
                }
              ]
            }
          ]
        },

        // Final spacer
        {
          type: "spacer",
          attrs: {
            height: "lg"
          }
        },

        // Footer with copyright
        {
          type: "paragraph",
          attrs: {
            textAlign: "center",
            color: "#999999"
          },
          content: [
            {
              type: "text",
              text: `© ${new Date().getFullYear()} ${releaseData.artist}. Thank you for supporting independent music.`
            }
          ]
        }
      ]
    };
  }

  private generateHtmlTemplate(releaseData: MusicReleaseData, platformLinks: PlatformLink[], colorPalette?: ColorPalette): string {
    const isTrack = releaseData.type === 'track';
    const releaseType = isTrack ? 'Single' : 'Album';
    const primaryColor = colorPalette?.primary || "#000000";
    const accentColor = colorPalette?.accent || "#ff6b6b";

    // Generate platform buttons with proper SVG icons in a grid layout
    // Create custom HTML component for uniform streaming buttons
    const createStreamingButton = (platform: PlatformLink) => {
      const iconHtml = platform.iconSvg
        ? `${platform.iconSvg}`
        : `<span style="font-size: 18px;">${platform.icon}</span>`;

      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 8px;">
          <tr>
            <td>
              <a href="${platform.url}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style="display: block; text-decoration: none; background: #2a2a2a; border: 1px solid #404040; border-radius: 8px; padding: 0; height: 60px; width: 100%; box-sizing: border-box; transition: all 0.2s ease;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; height: 60px;">
                  <tr>
                    <td style="width: 60px; text-align: center; vertical-align: middle;">
                      <div style="width: 32px; height: 32px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        ${iconHtml}
                      </div>
                    </td>
                    <td style="vertical-align: middle; padding-left: 8px;">
                      <span style="color: #ffffff; font-size: 16px; font-weight: 500; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.2;">
                        ${platform.name}
                      </span>
                    </td>
                    <td style="width: 80px; text-align: center; vertical-align: middle; padding-right: 16px;">
                      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #ffffff;">
                        <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span style="font-size: 14px; font-weight: 600; letter-spacing: 0.5px; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                          PLAY
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>`;
    };

    const platformButtons = platformLinks.map(platform => createStreamingButton(platform)).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${releaseData.title} - ${releaseData.artist}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            color: #ffffff;
            line-height: 1.4;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .email-wrapper {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
            min-height: 100vh;
            padding: 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
            overflow: hidden;
        }
        
        /* Hero Section with Artwork Background */
        .hero-section {
            position: relative;
            height: 500px;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${this.darkenColor(primaryColor, 30)} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${releaseData.artworkUrl}');
            background-size: cover;
            background-position: center;
            opacity: 0.15;
            filter: blur(20px);
            transform: scale(1.1);
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            padding: 40px 20px;
        }
        
        .release-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #ffffff;
            margin-bottom: 20px;
        }
        
        .hero-title {
            font-size: 48px;
            font-weight: 900;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: -2px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            line-height: 0.9;
        }
        
        .hero-artist {
            font-size: 20px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 30px;
            letter-spacing: -0.5px;
        }
        
        .hero-cta {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: #1DB954;
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 32px rgba(29, 185, 84, 0.4);
            border: 2px solid transparent;
        }
        
        .hero-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(29, 185, 84, 0.6);
            background: #1ed760;
        }
        
        .spotify-icon {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }
        
        /* Content Section */
        .content-section {
            background: #ffffff;
            padding: 60px 40px;
        }
        
        .artwork-showcase {
            text-align: center;
            margin-bottom: 50px;
        }
        
        .artwork-container {
            position: relative;
            display: inline-block;
            margin-bottom: 30px;
        }
        
        .artwork {
            width: 280px;
            height: 280px;
            border-radius: 20px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .artwork:hover {
            transform: scale(1.05) rotate(2deg);
        }
        
        .release-info {
            text-align: center;
        }
        
        .release-title {
            font-size: 32px;
            font-weight: 800;
            color: #000000;
            margin-bottom: 8px;
            letter-spacing: -1px;
        }
        
        .artist-name {
            font-size: 18px;
            font-weight: 500;
            color: #666666;
            margin-bottom: 16px;
        }
        
        .release-meta {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: #f8f9fa;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 500;
            color: #666666;
        }
        
        .meta-dot {
            width: 4px;
            height: 4px;
            background: #cccccc;
            border-radius: 50%;
        }
        
        /* Platforms Section */
        .platforms-section {
            margin-top: 60px;
            text-align: center;
        }
        
        .section-header {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 8px;
        }
        
        .section-subtitle {
            font-size: 16px;
            color: #666666;
            font-weight: 400;
        }
        
        /* Platform buttons are now handled with inline table styles for better email client compatibility */
        
        /* Social Proof Section */
        .social-section {
            background: linear-gradient(135deg, ${accentColor} 0%, ${this.darkenColor(accentColor, 20)} 100%);
            color: #ffffff;
            padding: 50px 40px;
            text-align: center;
            margin-top: 60px;
        }
        
        .social-title {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -1px;
        }
        
        .social-text {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
            max-width: 400px;
            margin: 0 auto 30px;
            line-height: 1.5;
        }
        
        .social-cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .social-cta:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
        }
        
        /* Footer */
        .footer {
            background: #000000;
            color: #666666;
            text-align: center;
            padding: 40px 20px;
            font-size: 14px;
            font-weight: 400;
        }
        
        .footer-text {
            margin-bottom: 20px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .footer-link {
            color: #999999;
            text-decoration: none;
            font-size: 12px;
            transition: color 0.3s ease;
        }
        
        .footer-link:hover {
            color: #ffffff;
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
            .hero-title {
                font-size: 36px;
            }
            
            .hero-artist {
                font-size: 18px;
            }
            
            .content-section {
                padding: 40px 20px;
            }
            
            .artwork {
                width: 240px;
                height: 240px;
            }
            
            .release-title {
                font-size: 28px;
            }
            
            /* Mobile styles for platform buttons are handled inline */
            
            .social-section {
                padding: 40px 20px;
            }
            
            .social-title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <!-- Hero Section -->
            <div class="hero-section">
                <div class="hero-bg"></div>
                <div class="hero-content">
                    <div class="release-badge">${releaseType} • Out Now</div>
                    <h1 class="hero-title">${releaseData.title}</h1>
                    <p class="hero-artist">${releaseData.artist}</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td>
                          <a href="${releaseData.spotifyUrl}" 
                             target="_blank" 
                             rel="noopener noreferrer"
                             style="display: block; text-decoration: none; background: #1DB954; border-radius: 50px; padding: 16px 32px; color: #ffffff; font-weight: 700; font-size: 16px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 8px 32px rgba(29, 185, 84, 0.4); transition: all 0.3s ease;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td style="vertical-align: middle; padding-right: 12px;">
                                  <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                                  </svg>
                                </td>
                                <td style="vertical-align: middle;">
                                  Play on Spotify
                                </td>
                              </tr>
                            </table>
                          </a>
                        </td>
                      </tr>
                    </table>
                </div>
            </div>
            
            <!-- Content Section -->
            <div class="content-section">
                <div class="artwork-showcase">
                    <div class="artwork-container">
                        <img src="${releaseData.artworkUrl}" 
                             alt="${releaseData.title} artwork" 
                             class="artwork">
                    </div>
                    <div class="release-info">
                        <h2 class="release-title">${releaseData.title}</h2>
                        <p class="artist-name">${releaseData.artist}</p>
                        <div class="release-meta">
                            <span>${releaseType}</span>
                            <div class="meta-dot"></div>
                            <span>${new Date(releaseData.releaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Platforms Section -->
                <div class="platforms-section">
                    <div class="section-header">
                        <h3 class="section-title">Stream Everywhere</h3>
                        <p class="section-subtitle">Available on all major platforms</p>
                    </div>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 400px; margin: 0 auto;">
                      <tr>
                        <td>
                          ${platformButtons}
                        </td>
                      </tr>
                    </table>
                </div>
            </div>
            
            <!-- Social Proof Section -->
            <div class="social-section">
                <h3 class="social-title">Share the Vibe</h3>
                <p class="social-text">
                    Love what you hear? Help us reach more music lovers by sharing this track with your friends and followers.
                </p>
                <a href="#" class="social-cta">
                    <span>Share Now</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </a>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">Thank you for supporting independent music</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Unsubscribe</a>
                    <a href="#" class="footer-link">Update Preferences</a>
                    <a href="#" class="footer-link">Privacy Policy</a>
                </div>
                <p style="font-size: 12px; color: #444444;">
                    © ${new Date().getFullYear()} ${releaseData.artist}. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Helper method to darken a color
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

}

export const spotifyTemplateGenerator = new SpotifyTemplateGenerator();