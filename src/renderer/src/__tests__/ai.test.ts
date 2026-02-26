import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateCardStats, checkOllamaAvailable, generateText } from '../lib/ai'
import type { AIProviderConfig } from '../types'

// Mock @google/genai
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: '' }),
      generateImages: vi.fn().mockResolvedValue({ generatedImages: [] })
    }
  }))
}))

const ollamaConfig: AIProviderConfig = {
  id: 'test-ollama',
  provider: 'ollama',
  name: 'Test Ollama',
  enabled: true,
  baseUrl: 'http://localhost:11434',
  textModel: 'llama3'
}

describe('generateCardStats', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({
        message: { content: '{"Speed": 85, "Power": 72, "Skill": 90}' }
      }))
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses JSON response into stats object', async () => {
    const stats = await generateCardStats(ollamaConfig, 'Dragon', [
      { name: 'Speed', min: 0, max: 100 },
      { name: 'Power', min: 0, max: 100 },
      { name: 'Skill', min: 0, max: 100 }
    ])
    expect(stats).toEqual({ Speed: 85, Power: 72, Skill: 90 })
  })

  it('returns empty object on invalid JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({
        message: { content: 'I cannot generate stats right now.' }
      }))
    )
    const stats = await generateCardStats(ollamaConfig, 'Dragon', [
      { name: 'Speed', min: 0, max: 100 }
    ])
    expect(stats).toEqual({})
  })

  it('extracts JSON from surrounding text', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({
        message: { content: 'Here are the stats: {"Speed": 50, "Power": 60} hope that helps!' }
      }))
    )
    const stats = await generateCardStats(ollamaConfig, 'Dragon', [
      { name: 'Speed', min: 0, max: 100 },
      { name: 'Power', min: 0, max: 100 }
    ])
    expect(stats).toEqual({ Speed: 50, Power: 60 })
  })
})

describe('checkOllamaAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when Ollama responds OK', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response('{"models":[]}', { status: 200 })
    )
    const result = await checkOllamaAvailable('http://localhost:11434')
    expect(result).toBe(true)
  })

  it('returns false when fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new Error('Connection refused')
    })
    const result = await checkOllamaAvailable('http://localhost:11434')
    expect(result).toBe(false)
  })

  it('returns false on non-OK response', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response('', { status: 500 })
    )
    const result = await checkOllamaAvailable('http://localhost:11434')
    expect(result).toBe(false)
  })
})

describe('generateText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws for unsupported provider', async () => {
    const config = { ...ollamaConfig, provider: 'unsupported' as any }
    await expect(generateText(config, { prompt: 'test' })).rejects.toThrow('Unsupported provider')
  })

  it('calls Ollama API correctly', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ message: { content: 'Hello world' } }))
    )
    const result = await generateText(ollamaConfig, { prompt: 'Say hello' })
    expect(result).toBe('Hello world')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({ method: 'POST' })
    )
  })
})
