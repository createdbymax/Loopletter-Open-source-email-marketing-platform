export interface PlatformLink {
    name: string;
    url: string;
    icon: string;
    color: string;
    iconSvg?: string;
}
export interface MusicPlatforms {
    apple?: string;
    youtube?: string;
    amazon?: string;
    tidal?: string;
    deezer?: string;
    soundcloud?: string;
}
class MusicLinkService {
    async generatePlatformLinks(isrc?: string, upc?: string, artistName?: string, trackTitle?: string, spotifyUrl?: string): Promise<PlatformLink[]> {
        const links: PlatformLink[] = [];
        if (spotifyUrl) {
            try {
                const songlinkData = await this.getSonglinkData(spotifyUrl);
                if (songlinkData) {
                    return this.parseSonglinkResponse(songlinkData);
                }
            }
            catch (error) {
                console.warn('Songlink API failed, falling back to manual generation:', error);
            }
        }
        if (isrc || (artistName && trackTitle)) {
            links.push({
                name: 'Apple Music',
                url: await this.getAppleMusicUrl(isrc, artistName, trackTitle),
                icon: '🎵',
                color: '#000000',
                iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.001-.08-.004-.12-.004H6.027c-.04 0-.08.003-.12.004-.525.015-1.046.057-1.563.15-.674.121-1.304.353-1.878.727-1.118.733-1.863 1.732-2.18 3.043-.175.72-.24 1.452-.24 2.19v11.751c0 .738.065 1.47.24 2.19.317 1.31 1.062 2.31 2.18 3.043.574.374 1.204.606 1.878.727.517.093 1.038.135 1.563.15.04.001.08.004.12.004h11.946c.04 0 .08-.003.12-.004.526-.015 1.047-.057 1.564-.15.673-.121 1.303-.353 1.877-.727 1.118-.733 1.863-1.732 2.18-3.043.175-.72.24-1.452.24-2.19V6.124zM12.057 19.062c-3.857 0-6.994-3.138-6.994-6.994s3.137-6.994 6.994-6.994c3.856 0 6.993 3.138 6.993 6.994s-3.137 6.994-6.993 6.994z"/></svg>`
            });
        }
        if (artistName && trackTitle) {
            links.push({
                name: 'YouTube Music',
                url: this.getYouTubeMusicUrl(artistName, trackTitle),
                icon: '▶️',
                color: '#FF0000',
                iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`
            });
        }
        if (artistName && trackTitle) {
            links.push({
                name: 'Amazon Music',
                url: this.getAmazonMusicUrl(artistName, trackTitle),
                icon: '🎧',
                color: '#1A1A1A',
                iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v-.07zM17.9 17.39c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
            });
        }
        if (artistName && trackTitle) {
            links.push({
                name: 'Tidal',
                url: this.getTidalUrl(artistName, trackTitle),
                icon: '🌊',
                color: '#000000',
                iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 6.546L8.473 2.999 4.928 6.546l3.544 3.547 3.545-3.547zm7.058 0L15.53 2.999l-3.544 3.547 3.544 3.547 3.545-3.547zM8.473 10.094l-3.545 3.547 3.545 3.547 3.544-3.547-3.544-3.547zm7.058 0l-3.544 3.547 3.544 3.547 3.545-3.547-3.545-3.547zm-3.514 7.094l-3.544 3.547 3.544 3.547 3.544-3.547-3.544-3.547z"/></svg>`
            });
        }
        if (artistName && trackTitle) {
            links.push({
                name: 'Deezer',
                url: this.getDeezerUrl(artistName, trackTitle),
                icon: '🎶',
                color: '#FF6600',
                iconSvg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.81 12.74h-1.44v1.44h1.44v-1.44zm-1.44-1.62h1.44v-1.44h-1.44v1.44zm-1.62 0h1.44v-1.44h-1.44v1.44zm0 1.62h1.44v-1.44h-1.44v1.44zm0 1.62h1.44v-1.44h-1.44v1.44zm-1.62 0h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm-1.62 3.24h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44V9.5h-1.44v1.44z"/></svg>`
            });
        }
        return links;
    }
    private async getSonglinkData(spotifyUrl: string): Promise<any> {
        const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`;
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Loopletter/1.0'
            }
        });
        if (!response.ok) {
            throw new Error(`Songlink API error: ${response.status}`);
        }
        return await response.json();
    }
    private parseSonglinkResponse(data: any): PlatformLink[] {
        const links: PlatformLink[] = [];
        const linksByPlatform = data.linksByPlatform || {};
        if (linksByPlatform.appleMusic) {
            links.push({
                name: 'Apple Music',
                url: linksByPlatform.appleMusic.url,
                icon: '🎵',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.001-.08-.004-.12-.004H6.027c-.04 0-.08.003-.12.004-.525.015-1.046.057-1.563.15-.674.121-1.304.353-1.878.727-1.118.733-1.863 1.732-2.18 3.043-.175.72-.24 1.452-.24 2.19v11.751c0 .738.065 1.47.24 2.19.317 1.31 1.062 2.31 2.18 3.043.574.374 1.204.606 1.878.727.517.093 1.038.135 1.563.15.04.001.08.004.12.004h11.946c.04 0 .08-.003.12-.004.526-.015 1.047-.057 1.564-.15.673-.121 1.303-.353 1.877-.727 1.118-.733 1.863-1.732 2.18-3.043.175-.72.24-1.452.24-2.19V6.124zM12.057 19.062c-3.857 0-6.994-3.138-6.994-6.994s3.137-6.994 6.994-6.994c3.856 0 6.993 3.138 6.993 6.994s-3.137 6.994-6.993 6.994z"/></svg>`
            });
        }
        if (linksByPlatform.youtubeMusic) {
            links.push({
                name: 'YouTube Music',
                url: linksByPlatform.youtubeMusic.url,
                icon: '▶️',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`
            });
        }
        if (linksByPlatform.amazonMusic) {
            links.push({
                name: 'Amazon Music',
                url: linksByPlatform.amazonMusic.url,
                icon: '🎧',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v-.07zM17.9 17.39c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`
            });
        }
        if (linksByPlatform.tidal) {
            links.push({
                name: 'Tidal',
                url: linksByPlatform.tidal.url,
                icon: '🌊',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#ffffff"><path d="M12.017 6.546L8.473 2.999 4.928 6.546l3.544 3.547 3.545-3.547zm7.058 0L15.53 2.999l-3.544 3.547 3.544 3.547 3.545-3.547zM8.473 10.094l-3.545 3.547 3.545 3.547 3.544-3.547-3.544-3.547zm7.058 0l-3.544 3.547 3.544 3.547 3.545-3.547-3.545-3.547zm-3.514 7.094l-3.544 3.547 3.544 3.547 3.544-3.547-3.544-3.547z"/></svg>`
            });
        }
        if (linksByPlatform.deezer) {
            links.push({
                name: 'Deezer',
                url: linksByPlatform.deezer.url,
                icon: '🎶',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#FEAA2D"><path d="M18.81 12.74h-1.44v1.44h1.44v-1.44zm-1.44-1.62h1.44v-1.44h-1.44v1.44zm-1.62 0h1.44v-1.44h-1.44v1.44zm0 1.62h1.44v-1.44h-1.44v1.44zm0 1.62h1.44v-1.44h-1.44v1.44zm-1.62 0h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm-1.62 3.24h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44v-1.44h-1.44v1.44zm0-1.62h1.44V9.5h-1.44v1.44z"/></svg>`
            });
        }
        if (linksByPlatform.soundcloud) {
            links.push({
                name: 'SoundCloud',
                url: linksByPlatform.soundcloud.url,
                icon: '☁️',
                color: '#2a2a2a',
                iconSvg: `<svg viewBox="0 0 24 24" fill="#FF5500"><path d="M8.8 12.3c-.2 0-.4-.1-.5-.2-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2s.4.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2zm2.4 0c-.2 0-.4-.1-.5-.2-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2s.4.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2zm2.4 0c-.2 0-.4-.1-.5-.2-.1-.1-.2-.3-.2-.5s.1-.4.2-.5c.1-.1.3-.2.5-.2s.4.1.5.2c.1.1.2.3.2.5s-.1.4-.2.5c-.1.1-.3.2-.5.2z"/></svg>`
            });
        }
        return links;
    }
    private async getAppleMusicUrl(isrc?: string, artistName?: string, trackTitle?: string): Promise<string> {
        if (artistName && trackTitle) {
            try {
                const query = encodeURIComponent(`${artistName} ${trackTitle}`);
                const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    return data.results[0].trackViewUrl.replace('itunes.apple.com', 'music.apple.com');
                }
            }
            catch (error) {
                console.error('Error fetching Apple Music URL:', error);
            }
        }
        if (artistName && trackTitle) {
            const query = encodeURIComponent(`${artistName} ${trackTitle}`);
            return `https://music.apple.com/search?term=${query}`;
        }
        return 'https://music.apple.com';
    }
    private getYouTubeMusicUrl(artistName: string, trackTitle: string): string {
        const query = encodeURIComponent(`${artistName} ${trackTitle}`);
        return `https://music.youtube.com/search?q=${query}`;
    }
    private getAmazonMusicUrl(artistName: string, trackTitle: string): string {
        const query = encodeURIComponent(`${artistName} ${trackTitle}`);
        return `https://music.amazon.com/search/${query}`;
    }
    private getTidalUrl(artistName: string, trackTitle: string): string {
        const query = encodeURIComponent(`${artistName} ${trackTitle}`);
        return `https://tidal.com/search?q=${query}`;
    }
    private getDeezerUrl(artistName: string, trackTitle: string): string {
        const query = encodeURIComponent(`${artistName} ${trackTitle}`);
        return `https://www.deezer.com/search/${query}`;
    }
    generateUniversalLink(spotifyUrl: string): string {
        return spotifyUrl;
    }
}
export const musicLinkService = new MusicLinkService();
