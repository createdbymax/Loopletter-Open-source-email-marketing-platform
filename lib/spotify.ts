export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        images: Array<{
            url: string;
            height: number;
            width: number;
        }>;
        release_date: string;
    };
    external_ids: {
        isrc?: string;
    };
    external_urls: {
        spotify: string;
    };
    preview_url?: string;
}
export interface SpotifyAlbum {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    images: Array<{
        url: string;
        height: number;
        width: number;
    }>;
    release_date: string;
    external_ids: {
        upc?: string;
    };
    external_urls: {
        spotify: string;
    };
    tracks: {
        items: Array<{
            id: string;
            name: string;
            track_number: number;
        }>;
    };
}
export interface MusicReleaseData {
    type: 'track' | 'album';
    title: string;
    artist: string;
    releaseDate: string;
    artworkUrl: string;
    spotifyUrl: string;
    isrc?: string;
    upc?: string;
    previewUrl?: string;
    tracks?: Array<{
        id: string;
        name: string;
        track_number: number;
    }>;
}
class SpotifyAPI {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;
    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
        if (!this.clientId || !this.clientSecret) {
            console.warn('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
        }
    }
    private async getAccessToken(): Promise<string> {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
        }
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Spotify API error:', response.status, errorText);
            throw new Error(`Failed to get Spotify access token: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        return this.accessToken!;
    }
    private async makeRequest(url: string) {
        const token = await this.getAccessToken();
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async getTrack(trackId: string): Promise<SpotifyTrack> {
        return this.makeRequest(`https://api.spotify.com/v1/tracks/${trackId}`);
    }
    async getAlbum(albumId: string): Promise<SpotifyAlbum> {
        return this.makeRequest(`https://api.spotify.com/v1/albums/${albumId}`);
    }
    parseSpotifyUrl(url: string): {
        type: 'track' | 'album';
        id: string;
    } | null {
        const patterns = [
            /spotify:track:([a-zA-Z0-9]+)/,
            /spotify:album:([a-zA-Z0-9]+)/,
            /open\.spotify\.com\/track\/([a-zA-Z0-9]+)(?:\?.*)?/,
            /open\.spotify\.com\/album\/([a-zA-Z0-9]+)(?:\?.*)?/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                const type = url.includes('track') ? 'track' : 'album';
                return { type, id: match[1] };
            }
        }
        return null;
    }
    async getMusicReleaseData(spotifyUrl: string): Promise<MusicReleaseData> {
        const parsed = this.parseSpotifyUrl(spotifyUrl);
        if (!parsed) {
            throw new Error('Invalid Spotify URL');
        }
        if (parsed.type === 'track') {
            const track = await this.getTrack(parsed.id);
            return {
                type: 'track',
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                releaseDate: track.album.release_date,
                artworkUrl: track.album.images[0]?.url || '',
                spotifyUrl: track.external_urls.spotify,
                isrc: track.external_ids.isrc,
                previewUrl: track.preview_url,
            };
        }
        else {
            const album = await this.getAlbum(parsed.id);
            return {
                type: 'album',
                title: album.name,
                artist: album.artists.map(a => a.name).join(', '),
                releaseDate: album.release_date,
                artworkUrl: album.images[0]?.url || '',
                spotifyUrl: album.external_urls.spotify,
                upc: album.external_ids.upc,
                tracks: album.tracks.items,
            };
        }
    }
}
export const spotifyAPI = new SpotifyAPI();
