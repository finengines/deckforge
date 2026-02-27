import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  searchIconify,
  searchUnDraw,
  searchSVGRepo,
  searchUnsplash,
  searchPexels,
  searchPixabay,
  searchAssets
} from '../lib/assetApi'
import type { AssetResult } from '../stores/assetStore'

// Mock global fetch
global.fetch = vi.fn()

describe('Asset API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchIconify', () => {
    it('should return normalized results', async () => {
      const mockResponse = {
        icons: ['mdi:home', 'fa:user', 'lucide:settings'],
        total: 3
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const results = await searchIconify('test')

      expect(results).toHaveLength(3)
      expect(results[0]).toMatchObject({
        id: 'mdi:home',
        provider: 'iconify',
        type: 'svg',
        previewUrl: expect.stringContaining('mdi/home.svg'),
        fullUrl: expect.stringContaining('mdi/home.svg')
      })
    })

    it('should handle empty results', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ icons: [] })
      })

      const results = await searchIconify('nonexistent')
      expect(results).toEqual([])
    })

    it('should throw on network error', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      await expect(searchIconify('test')).rejects.toThrow('Iconify search failed')
    })
  })

  describe('searchUnDraw', () => {
    it('should filter curated illustrations', async () => {
      const results = await searchUnDraw('coding')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toMatchObject({
        provider: 'undraw',
        type: 'svg'
      })
    })

    it('should return empty for no matches', async () => {
      const results = await searchUnDraw('xyzabc123nonexistent')
      expect(results).toEqual([])
    })
  })

  describe('searchSVGRepo', () => {
    it('should filter curated collections', async () => {
      const results = await searchSVGRepo('star')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toMatchObject({
        provider: 'svgrepo',
        type: 'svg'
      })
    })
  })

  describe('searchUnsplash', () => {
    it('should require API key', async () => {
      await expect(searchUnsplash('test', '', 1, 20)).rejects.toThrow(
        'Unsplash API key required'
      )
    })

    it('should return normalized results', async () => {
      const mockResponse = {
        results: [
          {
            id: 'photo1',
            description: 'Beautiful landscape',
            alt_description: 'Mountain view',
            urls: {
              small: 'https://example.com/small.jpg',
              regular: 'https://example.com/regular.jpg',
              full: 'https://example.com/full.jpg'
            },
            width: 1920,
            height: 1080,
            user: { name: 'Test User', username: 'testuser' }
          }
        ],
        total: 1,
        total_pages: 1
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const results = await searchUnsplash('test', 'fake-api-key')

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: 'photo1',
        provider: 'unsplash',
        type: 'image',
        previewUrl: 'https://example.com/small.jpg',
        fullUrl: 'https://example.com/regular.jpg',
        title: 'Mountain view',
        attribution: 'Photo by Test User on Unsplash',
        width: 1920,
        height: 1080
      })
    })

    it('should handle invalid API key', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(searchUnsplash('test', 'invalid-key')).rejects.toThrow(
        'Invalid Unsplash API key'
      )
    })
  })

  describe('searchPexels', () => {
    it('should require API key', async () => {
      await expect(searchPexels('test', '', 1, 20)).rejects.toThrow(
        'Pexels API key required'
      )
    })

    it('should return normalized results', async () => {
      const mockResponse = {
        photos: [
          {
            id: 123,
            alt: 'Sunset photo',
            src: {
              medium: 'https://example.com/medium.jpg',
              large: 'https://example.com/large.jpg',
              original: 'https://example.com/original.jpg'
            },
            width: 2000,
            height: 1500,
            photographer: 'Jane Doe'
          }
        ],
        total_results: 1,
        page: 1,
        per_page: 20
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const results = await searchPexels('test', 'fake-api-key')

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: '123',
        provider: 'pexels',
        type: 'image',
        previewUrl: 'https://example.com/medium.jpg',
        fullUrl: 'https://example.com/large.jpg',
        title: 'Sunset photo',
        attribution: 'Photo by Jane Doe on Pexels'
      })
    })
  })

  describe('searchPixabay', () => {
    it('should require API key', async () => {
      await expect(searchPixabay('test', '', 1, 20)).rejects.toThrow(
        'Pixabay API key required'
      )
    })

    it('should return normalized results', async () => {
      const mockResponse = {
        hits: [
          {
            id: 456,
            tags: 'nature, forest, trees',
            webformatURL: 'https://example.com/web.jpg',
            largeImageURL: 'https://example.com/large.jpg',
            imageWidth: 1800,
            imageHeight: 1200,
            user: 'PixUser'
          }
        ],
        total: 1,
        totalHits: 1
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const results = await searchPixabay('test', 'fake-api-key')

      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id: '456',
        provider: 'pixabay',
        type: 'image',
        previewUrl: 'https://example.com/web.jpg',
        fullUrl: 'https://example.com/large.jpg',
        title: 'nature, forest, trees',
        attribution: 'Image by PixUser from Pixabay'
      })
    })
  })

  describe('searchAssets (main dispatcher)', () => {
    it('should dispatch to correct provider', async () => {
      const mockIconifyResponse = {
        icons: ['test:icon'],
        total: 1
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIconifyResponse
      })

      const results = await searchAssets(
        'iconify',
        'test',
        { unsplash: '', pexels: '', pixabay: '' },
        1
      )

      expect(results).toHaveLength(1)
      expect(results[0].provider).toBe('iconify')
    })

    it('should throw for unknown provider', async () => {
      await expect(
        searchAssets(
          'unknown' as any,
          'test',
          { unsplash: '', pexels: '', pixabay: '' },
          1
        )
      ).rejects.toThrow('Unknown provider')
    })
  })

  describe('Result normalization', () => {
    it('should have consistent structure across providers', async () => {
      const mockIconifyResponse = {
        icons: ['test:icon'],
        total: 1
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIconifyResponse
      })

      const results = await searchIconify('test')

      // Check required fields
      expect(results[0]).toHaveProperty('id')
      expect(results[0]).toHaveProperty('provider')
      expect(results[0]).toHaveProperty('type')
      expect(results[0]).toHaveProperty('previewUrl')
      expect(results[0]).toHaveProperty('fullUrl')
      expect(results[0]).toHaveProperty('title')

      // Check types
      expect(typeof results[0].id).toBe('string')
      expect(['iconify', 'undraw', 'svgrepo', 'unsplash', 'pexels', 'pixabay']).toContain(
        results[0].provider
      )
      expect(['svg', 'image']).toContain(results[0].type)
    })
  })
})
