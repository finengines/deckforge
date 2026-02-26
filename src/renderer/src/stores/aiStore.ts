import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { AIProviderConfig, AISettings, AITask } from '../types'

interface AIStore extends AISettings {
  // Provider management
  addProvider: (config: Omit<AIProviderConfig, 'id'>) => void
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => void
  removeProvider: (id: string) => void
  setDefault: (task: AITask, providerId: string) => void

  // Generation state
  generating: boolean
  generationProgress: string
  setGenerating: (generating: boolean, progress?: string) => void
}

export const useAIStore = create<AIStore>()(
  persist(
    immer((set) => ({
      providers: [
        {
          id: 'gemini-default',
          provider: 'gemini',
          name: 'Google Gemini',
          enabled: false,
          apiKey: '',
          textModel: 'gemini-2.0-flash',
          imageModel: 'imagen-3.0-generate-002',
          visionModel: 'gemini-2.0-flash'
        },
        {
          id: 'ollama-default',
          provider: 'ollama',
          name: 'Ollama (Local)',
          enabled: false,
          baseUrl: 'http://localhost:11434',
          textModel: 'llama3.2',
          visionModel: 'llava'
        }
      ],
      defaults: {
        text: 'gemini-default',
        image: 'gemini-default',
        vision: 'gemini-default',
        stats: 'gemini-default'
      },
      generating: false,
      generationProgress: '',

      addProvider: (config) =>
        set((s) => {
          s.providers.push({ ...config, id: uuid() })
        }),

      updateProvider: (id, updates) =>
        set((s) => {
          const p = s.providers.find((p) => p.id === id)
          if (p) Object.assign(p, updates)
        }),

      removeProvider: (id) =>
        set((s) => {
          s.providers = s.providers.filter((p) => p.id !== id)
          // Reset defaults that pointed to this provider
          for (const task of Object.keys(s.defaults) as AITask[]) {
            if (s.defaults[task] === id) {
              s.defaults[task] = s.providers[0]?.id ?? ''
            }
          }
        }),

      setDefault: (task, providerId) =>
        set((s) => {
          s.defaults[task] = providerId
        }),

      setGenerating: (generating, progress = '') =>
        set((s) => {
          s.generating = generating
          s.generationProgress = progress
        })
    })),
    { name: 'deckforge-ai-settings' }
  )
)
