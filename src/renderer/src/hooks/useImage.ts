import { useState, useEffect } from 'react'

export function useImage(src: string | undefined): [HTMLImageElement | undefined, 'loading' | 'loaded' | 'error'] {
  const [image, setImage] = useState<HTMLImageElement>()
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    if (!src) {
      setImage(undefined)
      setStatus('error')
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      setImage(img)
      setStatus('loaded')
    }

    img.onerror = () => {
      setImage(undefined)
      setStatus('error')
    }

    // Handle both data URLs and local file paths
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
      img.src = src
    } else {
      // Local file path — use file:// protocol for Electron
      img.src = src.startsWith('file://') ? src : `file://${src}`
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return [image, status]
}
