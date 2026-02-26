import { useCallback, useEffect, useState } from 'react'

export interface ContextMenuItem {
  label: string
  icon?: string
  action: () => void
  disabled?: boolean
  separator?: boolean
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

export function useContextMenu(): {
  menu: ContextMenuState
  showMenu: (x: number, y: number, items: ContextMenuItem[]) => void
  hideMenu: () => void
} {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: []
  })

  const showMenu = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setMenu({ visible: true, x, y, items })
  }, [])

  const hideMenu = useCallback(() => {
    setMenu((m) => ({ ...m, visible: false }))
  }, [])

  useEffect(() => {
    const handler = (): void => hideMenu()
    document.addEventListener('click', handler)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideMenu()
    })
    return () => {
      document.removeEventListener('click', handler)
    }
  }, [hideMenu])

  return { menu, showMenu, hideMenu }
}
