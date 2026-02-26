import { describe, it, expect, beforeEach } from 'vitest'
import { useAIStore } from '../stores/aiStore'

describe('aiStore', () => {
  beforeEach(() => {
    useAIStore.setState({
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
      generationProgress: ''
    })
  })

  it('has default providers', () => {
    expect(useAIStore.getState().providers).toHaveLength(2)
    expect(useAIStore.getState().providers[0].name).toBe('Google Gemini')
    expect(useAIStore.getState().providers[1].name).toBe('Ollama (Local)')
  })

  it('adds a provider', () => {
    useAIStore.getState().addProvider({
      provider: 'openai',
      name: 'OpenAI',
      enabled: true,
      apiKey: 'sk-test',
      textModel: 'gpt-4'
    })
    expect(useAIStore.getState().providers).toHaveLength(3)
    expect(useAIStore.getState().providers[2].name).toBe('OpenAI')
  })

  it('updates a provider', () => {
    useAIStore.getState().updateProvider('gemini-default', { enabled: true, apiKey: 'test-key' })
    const gemini = useAIStore.getState().providers.find((p) => p.id === 'gemini-default')
    expect(gemini?.enabled).toBe(true)
    expect(gemini?.apiKey).toBe('test-key')
  })

  it('removes a provider and resets defaults', () => {
    useAIStore.getState().removeProvider('gemini-default')
    expect(useAIStore.getState().providers).toHaveLength(1)
    // Defaults should reset to first remaining provider
    expect(useAIStore.getState().defaults.text).toBe('ollama-default')
  })

  it('sets default provider for task', () => {
    useAIStore.getState().setDefault('text', 'ollama-default')
    expect(useAIStore.getState().defaults.text).toBe('ollama-default')
  })

  it('tracks generation state', () => {
    useAIStore.getState().setGenerating(true, 'Generating card 1/10...')
    expect(useAIStore.getState().generating).toBe(true)
    expect(useAIStore.getState().generationProgress).toBe('Generating card 1/10...')

    useAIStore.getState().setGenerating(false)
    expect(useAIStore.getState().generating).toBe(false)
  })
})
