import React from 'react'

export default function Toast({ toast }) {
  if (!toast) return null

  const type = toast.type || 'success'
  const label =
    type === 'success' ? '✓ Success' : type === 'error' ? '✗ Error' : 'Info'

  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      <div className={`toast toast-${type}`}>
        <div className="toast-title">{label}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  )
}

