/**
 * DeckForge AI Service
 * Pluggable AI integration for text, image, and vision tasks
 */

import type { AIProviderConfig } from '../types'

export interface GenerateTextOptions {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

export interface GenerateImageOptions {
  prompt: string
  width?: number
  height?: number
  count?: number
}

export interface AnalyzeImageOptions {
  imageBase64: string
  prompt: string
}

// --- Gemini ---

async function geminiText(config: AIProviderConfig, opts: GenerateTextOptions): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey: config.apiKey! })
  const result = await ai.models.generateContent({
    model: config.textModel,
    contents: opts.prompt,
    config: {
      maxOutputTokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7
    }
  })
  return result.text ?? ''
}

async function geminiImage(
  config: AIProviderConfig,
  opts: GenerateImageOptions
): Promise<Buffer[]> {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey: config.apiKey! })
  const response = await ai.models.generateImages({
    model: config.imageModel ?? 'imagen-3.0-generate-002',
    prompt: opts.prompt,
    config: { numberOfImages: opts.count ?? 1 }
  })
  return (response.generatedImages ?? []).map((img: any) =>
    Buffer.from(img.image.imageBytes, 'base64')
  )
}

async function geminiVision(
  config: AIProviderConfig,
  opts: AnalyzeImageOptions
): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey: config.apiKey! })
  const result = await ai.models.generateContent({
    model: config.visionModel ?? config.textModel,
    contents: [
      {
        role: 'user',
        parts: [
          { text: opts.prompt },
          { inlineData: { mimeType: 'image/jpeg', data: opts.imageBase64 } }
        ]
      }
    ]
  })
  return result.text ?? ''
}

// --- Ollama ---

async function ollamaText(config: AIProviderConfig, opts: GenerateTextOptions): Promise<string> {
  const baseUrl = config.baseUrl ?? 'http://localhost:11434'
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.textModel,
      messages: [
        ...(opts.systemPrompt ? [{ role: 'system', content: opts.systemPrompt }] : []),
        { role: 'user', content: opts.prompt }
      ],
      stream: false
    })
  })
  const data = await res.json()
  return data.message?.content ?? ''
}

async function ollamaVision(
  config: AIProviderConfig,
  opts: AnalyzeImageOptions
): Promise<string> {
  const baseUrl = config.baseUrl ?? 'http://localhost:11434'
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.visionModel ?? 'llava',
      messages: [{ role: 'user', content: opts.prompt, images: [opts.imageBase64] }],
      stream: false
    })
  })
  const data = await res.json()
  return data.message?.content ?? ''
}

// --- Dispatcher ---

export async function generateText(
  config: AIProviderConfig,
  opts: GenerateTextOptions
): Promise<string> {
  if (!opts.prompt || opts.prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty')
  }
  if (opts.prompt.length > 100000) {
    throw new Error('Prompt exceeds maximum length (100,000 characters)')
  }
  if (config.provider === 'gemini' && !config.apiKey) {
    throw new Error('API key is required for Gemini provider')
  }
  switch (config.provider) {
    case 'gemini':
      return geminiText(config, opts)
    case 'ollama':
      return ollamaText(config, opts)
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

export async function generateImage(
  config: AIProviderConfig,
  opts: GenerateImageOptions
): Promise<Buffer[]> {
  if (!opts.prompt || opts.prompt.trim().length === 0) {
    throw new Error('Image prompt cannot be empty')
  }
  if (config.provider === 'gemini' && !config.apiKey) {
    throw new Error('API key is required for Gemini provider')
  }
  switch (config.provider) {
    case 'gemini':
      return geminiImage(config, opts)
    default:
      throw new Error(`Image generation not supported for provider: ${config.provider}`)
  }
}

export async function analyzeImage(
  config: AIProviderConfig,
  opts: AnalyzeImageOptions
): Promise<string> {
  if (!opts.imageBase64) {
    throw new Error('Image data is required for analysis')
  }
  if (config.provider === 'gemini' && !config.apiKey) {
    throw new Error('API key is required for Gemini provider')
  }
  switch (config.provider) {
    case 'gemini':
      return geminiVision(config, opts)
    case 'ollama':
      return ollamaVision(config, opts)
    default:
      throw new Error(`Vision not supported for provider: ${config.provider}`)
  }
}

// --- Card-Specific Helpers ---

export async function generateCardDescription(
  config: AIProviderConfig,
  cardName: string,
  deckTheme?: string
): Promise<string> {
  return generateText(config, {
    prompt: `Write a short, engaging description (2-3 sentences) for a trading card called "${cardName}"${deckTheme ? ` in a ${deckTheme} themed deck` : ''}. Be creative and fun. No markdown formatting.`,
    temperature: 0.8
  })
}

export async function generateCardStats(
  config: AIProviderConfig,
  cardName: string,
  categories: { name: string; min: number; max: number }[],
  deckContext?: string
): Promise<Record<string, number>> {
  const categoryList = categories.map((c) => `${c.name} (${c.min}-${c.max})`).join(', ')
  const response = await generateText(config, {
    prompt: `For a trading card called "${cardName}"${deckContext ? ` in a deck about ${deckContext}` : ''}, generate realistic and varied stats for these categories: ${categoryList}. Return ONLY a JSON object with category names as keys and number values. No explanation.`,
    temperature: 0.6
  })

  try {
    const match = response.match(/\{[^}]+\}/)
    return match ? JSON.parse(match[0]) : {}
  } catch {
    return {}
  }
}

export async function generateFunFact(
  config: AIProviderConfig,
  cardName: string
): Promise<string> {
  return generateText(config, {
    prompt: `Write one fun, surprising fact about "${cardName}" for a trading card. Keep it to one sentence. No markdown.`,
    temperature: 0.8
  })
}

export async function describeImage(
  config: AIProviderConfig,
  imageBase64: string
): Promise<string> {
  return analyzeImage(config, {
    imageBase64,
    prompt:
      'Describe this image briefly for a trading card description. Be vivid and engaging. 2-3 sentences. No markdown.'
  })
}

// --- Ollama availability check ---

export async function checkOllamaAvailable(
  baseUrl = 'http://localhost:11434'
): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
