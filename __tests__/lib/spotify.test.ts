import { spotifyAPI } from '@/lib/spotify';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Spotify API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseSpotifyUrl', () => {
    it('should parse track URLs correctly', () => {
      const trackUrl = 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh';
      const result = spotifyAPI.parseSpotifyUrl(trackUrl);
      
      expect(result).toEqual({
        type: 'track',
        id: '4iV5W9uYEdYUVa79Axb7Rh'
      });
    });

    it('should parse album URLs correctly', () => {
      const albumUrl = 'https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3';
      const result = spotifyAPI.parseSpotifyUrl(albumUrl);
      
      expect(result).toEqual({
        type: 'album',
        id: '1DFixLWuPkv3KT3TnV35m3'
      });
    });

    it('should parse Spotify URI format', () => {
      const trackUri = 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh';
      const result = spotifyAPI.parseSpotifyUrl(trackUri);
      
      expect(result).toEqual({
        type: 'track',
        id: '4iV5W9uYEdYUVa79Axb7Rh'
      });
    });

    it('should return null for invalid URLs', () => {
      const invalidUrl = 'https://example.com/not-spotify';
      const result = spotifyAPI.parseSpotifyUrl(invalidUrl);
      
      expect(result).toBeNull();
    });
  });

  describe('getMusicReleaseData', () => {
    it('should handle track data correctly', async () => {
      const mockTokenResponse = {
        access_token: 'mock_token',
        expires_in: 3600
      };

      const mockTrackResponse = {
        id: '4iV5W9uYEdYUVa79Axb7Rh',
        name: 'Mr. Brightside',
        artists: [{ id: '0C0XlULifJtAgn6ZNCW2eu', name: 'The Killers' }],
        album: {
          id: '1DFixLWuPkv3KT3TnV35m3',
          name: 'Hot Fuss',
          images: [{ url: 'https://example.com/image.jpg', height: 640, width: 640 }],
          release_date: '2004-06-07'
        },
        external_ids: { isrc: 'USIR20400274' },
        external_urls: { spotify: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh' },
        preview_url: 'https://example.com/preview.mp3'
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTrackResponse)
        });

      const result = await spotifyAPI.getMusicReleaseData('https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh');

      expect(result).toEqual({
        type: 'track',
        title: 'Mr. Brightside',
        artist: 'The Killers',
        releaseDate: '2004-06-07',
        artworkUrl: 'https://example.com/image.jpg',
        spotifyUrl: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        isrc: 'USIR20400274',
        previewUrl: 'https://example.com/preview.mp3'
      });
    });

    it('should throw error for invalid URL', async () => {
      await expect(
        spotifyAPI.getMusicReleaseData('https://example.com/invalid')
      ).rejects.toThrow('Invalid Spotify URL');
    });
  });
});