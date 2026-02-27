import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

export type AssetProvider = 'iconify' | 'undraw' | 'svgrepo' | 'unsplash' | 'pexels' | 'pixabay'

export interface AssetResult {
  id: string
  provider: AssetProvider
  type: 'svg' | 'image'
  previewUrl: string
  fullUrl: string
  title: string
  attribution?: string
  width?: number
  height?: number
}

interface AssetAPIKeys {
  unsplash: string
  pexels: string
  pixabay: string
}

interface AssetStore {
  // API Keys
  apiKeys: AssetAPIKeys
  setAPIKey: (provider: keyof AssetAPIKeys, key: string) => void
  hasAPIKey: (provider: keyof AssetAPIKeys) => boolean

  // Search state
  selectedProvider: AssetProvider
  setProvider: (provider: AssetProvider) => void
  query: string
  setQuery: (query: string) => void
  results: AssetResult[]
  setResults: (results: AssetResult[]) => void
  appendResults: (results: AssetResult[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void

  // Pagination
  page: number
  hasMore: boolean
  setPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  nextPage: () => void

  // Cache (query -> results)
  cache: Map<string, AssetResult[]>
  cacheResults: (key: string, results: AssetResult[]) => void
  getCachedResults: (key: string) => AssetResult[] | undefined

  // Actions
  clearResults: () => void
  resetPagination: () => void
}

export const useAssetStore = create<AssetStore>()(
  persist(
    immer((set, get) => ({
      // API Keys (persisted)
      apiKeys: {
        unsplash: '',
        pexels: '',
        pixabay: ''
      },
      setAPIKey: (provider, key) =>
        set((s) => {
          s.apiKeys[provider] = key.trim()
        }),
      hasAPIKey: (provider) => {
        const key = get().apiKeys[provider]
        return !!key && key.trim().length > 0
      },

      // Search state (not persisted)
      selectedProvider: 'iconify',
      setProvider: (provider) =>
        set((s) => {
          s.selectedProvider = provider
          s.results = []
          s.page = 1
          s.error = null
        }),
      query: '',
      setQuery: (query) =>
        set((s) => {
          s.query = query
        }),
      results: [],
      setResults: (results) =>
        set((s) => {
          s.results = results
        }),
      appendResults: (results) =>
        set((s) => {
          s.results.push(...results)
        }),
      loading: false,
      setLoading: (loading) =>
        set((s) => {
          s.loading = loading
        }),
      error: null,
      setError: (error) =>
        set((s) => {
          s.error = error
        }),

      // Pagination
      page: 1,
      hasMore: true,
      setPage: (page) =>
        set((s) => {
          s.page = page
        }),
      setHasMore: (hasMore) =>
        set((s) => {
          s.hasMore = hasMore
        }),
      nextPage: () =>
        set((s) => {
          s.page += 1
        }),

      // Cache
      cache: new Map(),
      cacheResults: (key, results) =>
        set((s) => {
          s.cache.set(key, results)
        }),
      getCachedResults: (key) => {
        return get().cache.get(key)
      },

      // Actions
      clearResults: () =>
        set((s) => {
          s.results = []
          s.error = null
        }),
      resetPagination: () =>
        set((s) => {
          s.page = 1
          s.hasMore = true
        })
    })),
    {
      name: 'deckforge-asset-settings',
      partialize: (state) => ({ apiKeys: state.apiKeys })
    }
  )
)
