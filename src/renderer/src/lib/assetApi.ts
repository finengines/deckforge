import type { AssetProvider, AssetResult } from '../stores/assetStore'

// --- Iconify ---

interface IconifySearchResult {
  icons?: string[]
  total?: number
}

export async function searchIconify(query: string, limit = 48): Promise<AssetResult[]> {
  const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Iconify search failed: ${res.statusText}`)

  const data: IconifySearchResult = await res.json()
  if (!data.icons || data.icons.length === 0) return []

  return data.icons.map((iconName) => {
    const [prefix, name] = iconName.split(':')
    const svgUrl = `https://api.iconify.design/${prefix}/${name}.svg`
    return {
      id: iconName,
      provider: 'iconify',
      type: 'svg',
      previewUrl: svgUrl,
      fullUrl: svgUrl,
      title: iconName,
      width: 24,
      height: 24
    }
  })
}

// --- unDraw ---

// unDraw doesn't have a public search API, so we use a curated list
const UNDRAW_ILLUSTRATIONS = [
  { slug: 'creating', title: 'Creating' },
  { slug: 'design_thinking', title: 'Design Thinking' },
  { slug: 'portfolio', title: 'Portfolio' },
  { slug: 'coding', title: 'Coding' },
  { slug: 'data', title: 'Data' },
  { slug: 'developer_activity', title: 'Developer Activity' },
  { slug: 'meditation', title: 'Meditation' },
  { slug: 'team_work', title: 'Team Work' },
  { slug: 'online_resume', title: 'Online Resume' },
  { slug: 'product_tour', title: 'Product Tour' },
  { slug: 'server', title: 'Server' },
  { slug: 'mobile_app', title: 'Mobile App' },
  { slug: 'designer', title: 'Designer' },
  { slug: 'working', title: 'Working' },
  { slug: 'building', title: 'Building' },
  { slug: 'creative_thinking', title: 'Creative Thinking' },
  { slug: 'success_factors', title: 'Success Factors' },
  { slug: 'brainstorming', title: 'Brainstorming' },
  { slug: 'analyze', title: 'Analyze' },
  { slug: 'goals', title: 'Goals' },
  { slug: 'growth', title: 'Growth' },
  { slug: 'ideas', title: 'Ideas' },
  { slug: 'innovation', title: 'Innovation' },
  { slug: 'business_plan', title: 'Business Plan' },
  { slug: 'startup', title: 'Startup' },
  { slug: 'team_collaboration', title: 'Team Collaboration' },
  { slug: 'presentation', title: 'Presentation' },
  { slug: 'meeting', title: 'Meeting' },
  { slug: 'online_learning', title: 'Online Learning' },
  { slug: 'reading', title: 'Reading' },
  { slug: 'studying', title: 'Studying' },
  { slug: 'teaching', title: 'Teaching' },
  { slug: 'graduation', title: 'Graduation' },
  { slug: 'books', title: 'Books' },
  { slug: 'creative_process', title: 'Creative Process' },
  { slug: 'celebration', title: 'Celebration' },
  { slug: 'happy_announcement', title: 'Happy Announcement' },
  { slug: 'winners', title: 'Winners' },
  { slug: 'dreamer', title: 'Dreamer' },
  { slug: 'healthy_lifestyle', title: 'Healthy Lifestyle' },
  { slug: 'weather', title: 'Weather' },
  { slug: 'nature', title: 'Nature' },
  { slug: 'environment', title: 'Environment' },
  { slug: 'gardening', title: 'Gardening' },
  { slug: 'camping', title: 'Camping' },
  { slug: 'travelers', title: 'Travelers' },
  { slug: 'journey', title: 'Journey' },
  { slug: 'adventure', title: 'Adventure' },
  { slug: 'explore', title: 'Explore' },
  { slug: 'scientist', title: 'Scientist' }
]

export async function searchUnDraw(query: string): Promise<AssetResult[]> {
  const q = query.toLowerCase()
  const filtered = UNDRAW_ILLUSTRATIONS.filter(
    (ill) => ill.title.toLowerCase().includes(q) || ill.slug.includes(q)
  ).slice(0, 24)

  return filtered.map((ill) => ({
    id: ill.slug,
    provider: 'undraw',
    type: 'svg',
    previewUrl: `https://undraw.co/api/illustrations/${ill.slug}`,
    fullUrl: `https://undraw.co/api/illustrations/${ill.slug}`,
    title: ill.title,
    width: 500,
    height: 500
  }))
}

// --- SVG Repo ---

// SVG Repo doesn't have a public API, so we use a curated collection
const SVGREPO_COLLECTIONS = [
  { id: 'card', title: 'Card', tags: ['card', 'game', 'playing'] },
  { id: 'trophy', title: 'Trophy', tags: ['trophy', 'award', 'win'] },
  { id: 'star', title: 'Star', tags: ['star', 'favorite', 'rating'] },
  { id: 'crown', title: 'Crown', tags: ['crown', 'king', 'winner'] },
  { id: 'medal', title: 'Medal', tags: ['medal', 'award', 'achievement'] },
  { id: 'shield', title: 'Shield', tags: ['shield', 'protection', 'defense'] },
  { id: 'sword', title: 'Sword', tags: ['sword', 'weapon', 'battle'] },
  { id: 'fire', title: 'Fire', tags: ['fire', 'flame', 'hot'] },
  { id: 'lightning', title: 'Lightning', tags: ['lightning', 'bolt', 'electric'] },
  { id: 'heart', title: 'Heart', tags: ['heart', 'love', 'like'] },
  { id: 'diamond', title: 'Diamond', tags: ['diamond', 'gem', 'jewel'] },
  { id: 'flag', title: 'Flag', tags: ['flag', 'banner', 'marker'] },
  { id: 'rocket', title: 'Rocket', tags: ['rocket', 'space', 'launch'] },
  { id: 'target', title: 'Target', tags: ['target', 'goal', 'aim'] },
  { id: 'checkmark', title: 'Checkmark', tags: ['check', 'tick', 'done'] },
  { id: 'cross', title: 'Cross', tags: ['cross', 'x', 'close'] },
  { id: 'plus', title: 'Plus', tags: ['plus', 'add', 'new'] },
  { id: 'minus', title: 'Minus', tags: ['minus', 'remove', 'subtract'] },
  { id: 'arrow-up', title: 'Arrow Up', tags: ['arrow', 'up', 'direction'] },
  { id: 'arrow-down', title: 'Arrow Down', tags: ['arrow', 'down', 'direction'] }
]

export async function searchSVGRepo(query: string): Promise<AssetResult[]> {
  const q = query.toLowerCase()
  const filtered = SVGREPO_COLLECTIONS.filter(
    (item) => item.title.toLowerCase().includes(q) || item.tags.some((t) => t.includes(q))
  ).slice(0, 20)

  // Note: These are placeholder SVGs. In a real implementation, you'd fetch actual SVGs
  // from SVG Repo's collections or use their embed links if available
  return filtered.map((item) => ({
    id: item.id,
    provider: 'svgrepo',
    type: 'svg',
    previewUrl: `https://www.svgrepo.com/show/0/${item.id}.svg`, // Placeholder
    fullUrl: `https://www.svgrepo.com/show/0/${item.id}.svg`, // Placeholder
    title: item.title,
    width: 24,
    height: 24
  }))
}

// --- Unsplash ---

interface UnsplashPhoto {
  id: string
  description: string | null
  alt_description: string | null
  urls: {
    small: string
    regular: string
    full: string
  }
  width: number
  height: number
  user: {
    name: string
    username: string
  }
}

interface UnsplashSearchResult {
  results: UnsplashPhoto[]
  total: number
  total_pages: number
}

export async function searchUnsplash(
  query: string,
  apiKey: string,
  page = 1,
  perPage = 20
): Promise<AssetResult[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Unsplash API key required')
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${apiKey.trim()}` }
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid Unsplash API key')
    throw new Error(`Unsplash search failed: ${res.statusText}`)
  }

  const data: UnsplashSearchResult = await res.json()
  return data.results.map((photo) => ({
    id: photo.id,
    provider: 'unsplash',
    type: 'image',
    previewUrl: photo.urls.small,
    fullUrl: photo.urls.regular,
    title: photo.alt_description || photo.description || 'Untitled',
    attribution: `Photo by ${photo.user.name} on Unsplash`,
    width: photo.width,
    height: photo.height
  }))
}

// --- Pexels ---

interface PexelsPhoto {
  id: number
  alt: string
  src: {
    medium: string
    large: string
    original: string
  }
  width: number
  height: number
  photographer: string
}

interface PexelsSearchResult {
  photos: PexelsPhoto[]
  total_results: number
  page: number
  per_page: number
}

export async function searchPexels(
  query: string,
  apiKey: string,
  page = 1,
  perPage = 20
): Promise<AssetResult[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Pexels API key required')
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await fetch(url, {
    headers: { Authorization: apiKey.trim() }
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Invalid Pexels API key')
    throw new Error(`Pexels search failed: ${res.statusText}`)
  }

  const data: PexelsSearchResult = await res.json()
  return data.photos.map((photo) => ({
    id: String(photo.id),
    provider: 'pexels',
    type: 'image',
    previewUrl: photo.src.medium,
    fullUrl: photo.src.large,
    title: photo.alt || 'Untitled',
    attribution: `Photo by ${photo.photographer} on Pexels`,
    width: photo.width,
    height: photo.height
  }))
}

// --- Pixabay ---

interface PixabayHit {
  id: number
  tags: string
  webformatURL: string
  largeImageURL: string
  imageWidth: number
  imageHeight: number
  user: string
}

interface PixabaySearchResult {
  hits: PixabayHit[]
  total: number
  totalHits: number
}

export async function searchPixabay(
  query: string,
  apiKey: string,
  page = 1,
  perPage = 20
): Promise<AssetResult[]> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Pixabay API key required')
  }

  const url = `https://pixabay.com/api/?key=${apiKey.trim()}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Pixabay search failed: ${res.statusText}`)
  }

  const data: PixabaySearchResult = await res.json()
  return data.hits.map((hit) => ({
    id: String(hit.id),
    provider: 'pixabay',
    type: 'image',
    previewUrl: hit.webformatURL,
    fullUrl: hit.largeImageURL,
    title: hit.tags || 'Untitled',
    attribution: `Image by ${hit.user} from Pixabay`,
    width: hit.imageWidth,
    height: hit.imageHeight
  }))
}

// --- Main search function ---

export async function searchAssets(
  provider: AssetProvider,
  query: string,
  apiKeys: { unsplash: string; pexels: string; pixabay: string },
  page = 1
): Promise<AssetResult[]> {
  switch (provider) {
    case 'iconify':
      return searchIconify(query)
    case 'undraw':
      return searchUnDraw(query)
    case 'svgrepo':
      return searchSVGRepo(query)
    case 'unsplash':
      return searchUnsplash(query, apiKeys.unsplash, page)
    case 'pexels':
      return searchPexels(query, apiKeys.pexels, page)
    case 'pixabay':
      return searchPixabay(query, apiKeys.pixabay, page)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
