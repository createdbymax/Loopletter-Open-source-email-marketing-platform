import { POST, GET } from '@/app/api/spotify/generate-template/route';
import { NextRequest } from 'next/server';

// Mock the auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-id' }))
}));

// Mock the database functions
jest.mock('@/lib/db', () => ({
  getOrCreateArtistByClerkId: jest.fn(() => Promise.resolve({ id: 'test-artist-id' })),
  createTemplate: jest.fn((template) => Promise.resolve({ id: 'test-template-id', ...template }))
}));

// Mock the Spotify integration
jest.mock('@/lib/spotify-template-generator', () => ({
  spotifyTemplateGenerator: {
    createTemplateFromSpotify: jest.fn(() => Promise.resolve({
      name: 'Test Template',
      description: 'Test Description',
      category: 'music_release',
      html_content: '<html>Test</html>',
      variables: [],
      is_public: false,
      artist_id: 'test-artist-id'
    })),
    generateFromSpotifyUrl: jest.fn(() => Promise.resolve({
      releaseData: {
        type: 'track',
        title: 'Test Track',
        artist: 'Test Artist',
        releaseDate: '2024-01-01',
        artworkUrl: 'https://example.com/image.jpg',
        spotifyUrl: 'https://open.spotify.com/track/test',
        isrc: 'TEST123'
      },
      platformLinks: [],
      generatedHtml: '<html>Test</html>'
    }))
  }
}));

describe('/api/spotify/generate-template', () => {
  describe('POST', () => {
    it('should create template from Spotify URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/spotify/generate-template', {
        method: 'POST',
        body: JSON.stringify({
          spotifyUrl: 'https://open.spotify.com/track/test',
          templateName: 'My Test Template'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.template).toBeDefined();
      expect(data.spotifyData).toBeDefined();
      expect(data.template.id).toBe('test-template-id');
    });

    it('should return 400 for missing Spotify URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/spotify/generate-template', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Spotify URL is required');
    });
  });

  describe('GET', () => {
    it('should preview Spotify data without saving', async () => {
      const request = new NextRequest('http://localhost:3000/api/spotify/generate-template?url=https://open.spotify.com/track/test');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.releaseData).toBeDefined();
      expect(data.platformLinks).toBeDefined();
      expect(data.previewHtml).toBeDefined();
    });

    it('should return 400 for missing URL parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/spotify/generate-template');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Spotify URL is required');
    });
  });
});