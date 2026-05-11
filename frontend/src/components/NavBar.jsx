import React from 'react'

export default function NavBar({user, onSignOut, theme, onToggleTheme, onNavigate, currentView, onSwitchAccount}){
  const linkedTypes = Array.isArray(user?.linkedAccountTypes) ? user.linkedAccountTypes : []
  return (
    <header className={`nav-bar ${!user ? 'nav-auth' : ''}`}>
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
          <label className="theme-switch" title="Toggle theme">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={() => onToggleTheme && onToggleTheme()}
              aria-label="Toggle theme"
            />
            <span className="theme-slider" aria-hidden="true" />
          </label>
          {user ? (
            <div className="user-info">
              <div className="user-avatar" aria-label="Profile photo">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.name || 'User'} />
                ) : (
                  <span>{(user.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-name">{user.name}</div>
              {linkedTypes.length > 1 ? (
                <select
                  className="account-switch"
                  value={user.accountType || 'individual'}
                  onChange={(e)=> onSwitchAccount && onSwitchAccount(e.target.value)}
                  title="Switch account type"
                >
                  {linkedTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <div className="user-type">{user.accountType}</div>
              )}
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
