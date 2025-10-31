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
        const releaseData = await spotifyAPI.getMusicReleaseData(spotifyUrl);
        const platformLinks = customPlatformLinks || await musicLinkService.generatePlatformLinks(releaseData.isrc, releaseData.upc, releaseData.artist, releaseData.title, releaseData.spotifyUrl);
        let colorPalette: ColorPalette | undefined;
        try {
            colorPalette = await extractColorsFromImage(releaseData.artworkUrl);
        }
        catch (error) {
            console.warn('Could not extract colors from artwork:', error);
        }
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
                {
                    type: "spacer",
                    attrs: {
                        height: "xl"
                    }
                },
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
                {
                    type: "spacer",
                    attrs: {
                        height: "lg"
                    }
                },
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
                {
                    type: "spacer",
                    attrs: {
                        height: "xl"
                    }
                },
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
                {
                    type: "spacer",
                    attrs: {
                        height: "lg"
                    }
                },
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
                {
                    type: "spacer",
                    attrs: {
                        height: "xl"
                    }
                },
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
                {
                    type: "spacer",
                    attrs: {
                        height: "lg"
                    }
                },
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
        const createStreamingButton = (platform: PlatformLink) => {
            return `<a href="${platform.url}" style="background:${primaryColor}; color:#fff; padding:16px 32px; border-radius:8px; font-size:16px; font-weight:600; margin:0 8px 16px 8px; text-decoration:none; display:inline-block;">${platform.name}</a>`;
        };
        const platformButtons = platformLinks.map(platform => createStreamingButton(platform)).join('');
        return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8" />
    <title>${releaseData.title} - ${releaseData.artist}</title>
</head>
<body style="background-color:#f3f4f6; font-family: sans-serif; padding: 40px 0;">
    <div style="max-width:600px; background:#ffffff; margin:0 auto; padding:40px; border-radius:8px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:48px;">
            <p style="font-size:14px; font-weight:600; color:#4b5563; text-transform:uppercase; letter-spacing:2px; margin:0 0 16px 0;">${releaseType.toUpperCase()} • OUT NOW</p>
        </div>

        <!-- Main Title -->
        <div style="text-align:center; margin-bottom:48px;">
            <h1 style="font-size:48px; font-weight:bold; color:${primaryColor}; margin:0 0 16px 0; line-height:1.1;">${releaseData.title}</h1>
            <p style="font-size:24px; color:#374151; margin:0; font-weight:300;">${releaseData.artist}</p>
        </div>

        <!-- Release Info -->
        <div style="text-align:center; margin-bottom:48px;">
            <p style="font-size:16px; color:#4b5563; margin:0 0 8px 0;">${releaseType} • ${new Date(releaseData.releaseDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
        </div>

        <!-- Stream Section -->
        <div style="text-align:center; margin-bottom:48px;">
            <h2 style="font-size:28px; font-weight:bold; color:${primaryColor}; margin:0 0 24px 0;">Stream Everywhere</h2>
            <p style="font-size:16px; color:#4b5563; margin:0 0 32px 0;">Available on all major platforms</p>
            <div style="margin-bottom:16px;">
                ${platformButtons}
            </div>
        </div>

        <!-- Divider -->
        <hr style="border:1px solid #e5e7eb; margin:48px 0;" />

        <!-- Share Section -->
        <div style="text-align:center; margin-bottom:48px;">
            <h2 style="font-size:24px; font-weight:bold; color:${primaryColor}; margin:0 0 16px 0;">Share the Vibe</h2>
            <p style="font-size:16px; color:#4b5563; margin:0 0 24px 0; line-height:1.6;">Love what you hear? Help us reach more music lovers by sharing this track with your friends.</p>
            <div>
                <a href="#" style="background:${primaryColor}; color:#fff; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; margin:0 8px 12px 8px; text-decoration:none; display:inline-block;">Share on Twitter</a>
                <a href="#" style="background:${primaryColor}; color:#fff; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; margin:0 8px 12px 8px; text-decoration:none; display:inline-block;">Share on Instagram</a>
                <a href="#" style="background:${primaryColor}; color:#fff; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:500; margin:0 8px 12px 8px; text-decoration:none; display:inline-block;">Copy Link</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align:center; border-top:1px solid #e5e7eb; padding-top:32px;">
            <p style="font-size:14px; color:#6b7280; margin:0 0 16px 0;">© ${new Date().getFullYear()} ${releaseData.artist}. Thank you for supporting independent music.</p>
            <p style="font-size:12px; color:#9ca3af; margin:0;">123 Music Street, Nashville, TN 37203</p>
            <p style="font-size:12px; color:#9ca3af; margin:8px 0 0 0;"><a href="#" style="color:#9ca3af; text-decoration:underline;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
    }
}
export const spotifyTemplateGenerator = new SpotifyTemplateGenerator();
