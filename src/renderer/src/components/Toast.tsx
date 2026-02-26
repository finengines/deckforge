import React from 'react'
import { useToastStore } from '../hooks/useToast'

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

export function ToastContainer(): React.JSX.Element {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return <></>

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' toast-exit' : ''}`}>
          <span>{icons[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
