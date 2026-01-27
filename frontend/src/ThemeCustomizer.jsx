import React, { useState, useEffect } from 'react'

const themes = {
  light: {
    name: 'Light',
    colors: {
      '--bg': '#fffbeb',
      '--surface': '#ffffff',
      '--text': '#1f2937',
      '--muted': '#6b7280',
      '--primary': '#2563eb',
      '--border': '#e5e7eb'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      '--bg': '#111827',
      '--surface': '#1f2937',
      '--text': '#f9fafb',
      '--muted': '#9ca3af',
      '--primary': '#3b82f6',
      '--border': '#374151'
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      '--bg': '#ecfeff',
      '--surface': '#ffffff',
      '--text': '#164e63',
      '--muted': '#0891b2',
      '--primary': '#0284c7',
      '--border': '#a5f3fc'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      '--bg': '#f0fdf4',
      '--surface': '#ffffff',
      '--text': '#14532d',
      '--muted': '#15803d',
      '--primary': '#16a34a',
      '--border': '#bbf7d0'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      '--bg': '#fff7ed',
      '--surface': '#ffffff',
      '--text': '#7c2d12',
      '--muted': '#c2410c',
      '--primary': '#ea580c',
      '--border': '#fed7aa'
    }
  },
  minimal: {
    name: 'Minimal',
    colors: {
      '--bg': '#fafafa',
      '--surface': '#ffffff',
      '--text': '#171717',
      '--muted': '#737373',
      '--primary': '#404040',
      '--border': '#e5e5e5'
    }
  }
}

export default function ThemeCustomizer() {
  const [currentTheme, setCurrentTheme] = useState('light')
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('spendwise-theme')
    if (saved && themes[saved]) {
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (themeName) => {
    const theme = themes[themeName]
    if (!theme) return

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    setCurrentTheme(themeName)
    localStorage.setItem('spendwise-theme', themeName)
  }

  return (
    <div className="theme-customizer">
      <button 
        className="theme-toggle-btn"
        onClick={() => setShowPicker(!showPicker)}
        title="Change Theme"
      >
        🎨
      </button>
      
      {showPicker && (
        <div className="theme-picker">
          <h4>Choose Theme</h4>
          <div className="theme-options">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                onClick={() => {
                  applyTheme(key)
                  setShowPicker(false)
                }}
              >
                <div className="theme-preview">
                  <div style={{ background: theme.colors['--bg'] }} />
                  <div style={{ background: theme.colors['--primary'] }} />
                  <div style={{ background: theme.colors['--surface'] }} />
                </div>
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
