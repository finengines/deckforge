import React, { useState, useRef, useCallback } from 'react'

interface TooltipProps {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: React.ReactNode
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'inline-flex'
  },
  base: {
    position: 'absolute',
    padding: '4px 8px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 11,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 9999,
    color: 'var(--text-primary)',
    transition: 'opacity 0.15s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
}

const positionStyles: Record<string, React.CSSProperties> = {
  top: { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
  bottom: { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
  left: { right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' },
  right: { left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' }
}

export function Tooltip({ text, position = 'top', children }: TooltipProps): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 400)
  }, [])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <div style={styles.wrapper} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div style={{ ...styles.base, ...positionStyles[position], opacity: 1 }}>
          {text}
        </div>
      )}
    </div>
  )
}
