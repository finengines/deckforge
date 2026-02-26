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

// --- Deck Balancing ---

export interface BalanceAdjustment {
  cardId: string
  adjustments: Record<string, number>
}

export async function balanceDeckStats(
  config: AIProviderConfig,
  cards: { id: string; name: string; stats: Record<string, number> }[],
  categories: { id: string; name: string; min: number; max: number }[]
): Promise<BalanceAdjustment[]> {
  const cardData = cards.map((c) => {
    const namedStats: Record<string, number> = {}
    for (const cat of categories) {
      namedStats[cat.name] = c.stats[cat.id] ?? 0
    }
    return { id: c.id, name: c.name, stats: namedStats }
  })

  const prompt = `Analyze these trading card stats and suggest adjustments so no single card dominates. Each stat should stay within its defined range.

Categories: ${categories.map((c) => `${c.name} (${c.min}-${c.max})`).join(', ')}

Cards:
${JSON.stringify(cardData, null, 2)}

Return ONLY a JSON array where each element has: { "id": "<card id>", "adjustments": { "<stat name>": <new value>, ... } }
Only include cards that need changes. No explanation.`

  const response = await generateText(config, { prompt, temperature: 0.3 })

  try {
    const match = response.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as { id: string; adjustments: Record<string, number> }[]

    // Map stat names back to category IDs
    return parsed.map((item) => {
      const mapped: Record<string, number> = {}
      for (const cat of categories) {
        if (item.adjustments[cat.name] !== undefined) {
          mapped[cat.id] = Math.min(cat.max, Math.max(cat.min, item.adjustments[cat.name]))
        }
      }
      return { cardId: item.id, adjustments: mapped }
    })
  } catch {
    return []
  }
}

// --- Describe Card From Image ---

export interface CardDescriptionFromImage {
  name: string
  description: string
  funFact: string
  stats: Record<string, number>
}

export async function describeCardFromImage(
  config: AIProviderConfig,
  imageBase64: string,
  categories: { name: string; min: number; max: number }[]
): Promise<CardDescriptionFromImage> {
  const catList = categories.length > 0
    ? `\nStat categories: ${categories.map((c) => `${c.name} (${c.min}-${c.max})`).join(', ')}`
    : ''

  const response = await analyzeImage(config, {
    imageBase64,
    prompt: `Look at this trading card image and suggest:
1. A card name
2. A short description (2-3 sentences)
3. A fun fact (1 sentence)
4. Stat values for these categories${catList}

Return ONLY a JSON object with keys: "name", "description", "funFact", "stats" (object with category names as keys and number values). No explanation.`
  })

  try {
    const match = response.match(/\{[\s\S]*\}/)
    if (!match) return { name: '', description: '', funFact: '', stats: {} }
    return JSON.parse(match[0])
  } catch {
    return { name: '', description: '', funFact: '', stats: {} }
  }
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
