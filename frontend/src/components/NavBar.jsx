import React from 'react'

export default function NavBar({user, onSignOut, theme, onToggleTheme, onNavigate, currentView}){
  return (
    <header className="nav-bar">
      <div className="nav-inner">
        <div className="brand">SpendWise</div>
        <nav className="nav-links">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('dashboard'); }}
            style={{ fontWeight: currentView === 'dashboard' ? 'bold' : 'normal', opacity: currentView === 'dashboard' ? 1 : 0.7 }}
          >
            Overview
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('reports'); }}
            style={{ fontWeight: currentView === 'reports' ? 'bold' : 'normal', opacity: currentView === 'reports' ? 1 : 0.7 }}
          >
            Reports
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('settings'); }}
            style={{ fontWeight: currentView === 'settings' ? 'bold' : 'normal', opacity: currentView === 'settings' ? 1 : 0.7 }}
          >
            Settings
          </a>
        </nav>
        <div className="nav-actions">
          <button className="theme-toggle" onClick={() => onToggleTheme && onToggleTheme()} title="Toggle theme">{theme === 'dark' ? '🌙' : '☀️'}</button>
          {user ? (
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-type">{user.accountType}</div>
              <button className="btn-ghost small" onClick={onSignOut}>Sign out</button>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </header>
  )
}
