import React, {useEffect, useState} from 'react'
import apiUrl, { fetchWithTimeout } from './api'
import DashboardEnhanced from './DashboardEnhanced'
import Reports from './Reports'
import Settings from './Settings'
import SignIn from './SignIn'
import SignUp from './SignUp'
import NavBar from './components/NavBar'
import AstraChat from './AstraChat'
import Landing from './Landing'
import './index.css'
import Toast from './components/Toast'

export default function RootApp(){
  const [user,setUser] = useState(null)
  const [token,setToken] = useState(localStorage.getItem('token') || null)
  const [view,setView] = useState('landing')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [toast, setToast] = useState(null)

  useEffect(()=>{
    if (token) {
      fetch(apiUrl('/api/auth/me'),{headers:{'Authorization':'Bearer '+token}})
        .then(r=> r.ok ? r.json() : Promise.reject('no'))
        .then(d=> setUser(d))
        .catch(()=> { localStorage.removeItem('token'); setToken(null); setUser(null); })
    }
  },[token])

  // Warm backend on app load (helps on free-tier cold starts)
  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || ''
    if (!base) return
    fetchWithTimeout(apiUrl('/api/health'), {}, 8000).catch(() => {})
  }, [])

  useEffect(()=>{
    try{
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }catch(e){}
  },[theme])

  function toggleTheme(){ setTheme(t => t === 'light' ? 'dark' : 'light') }

  function onSignedIn(u,t){ setUser(u); setToken(t); setView('dashboard') }
  function onSignedUp(u,t){ setUser(u); setToken(t); setView('dashboard') }

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  useEffect(() => {
    if (!toast?.id) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast?.id])

  function switchToSignUp(){ setView('signup') }
  function switchToSignIn(){ setView('signin') }
  function switchToLanding(){ setView('landing') }
  function switchToReports(){ setView('reports') }
  function switchToDashboard(){ setView('dashboard') }

  function signOut(){ localStorage.removeItem('token'); setToken(null); setUser(null); setView('signin') }

  async function switchAccountType(accountType){
    if (!token || !accountType || accountType === user?.accountType) return
    try{
      const res = await fetch(apiUrl('/api/auth/switch-account'),{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({accountType})
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      setView('dashboard')
    }catch(err){
      alert('Account switch failed: '+err.message)
    }
  }

  return (
    <div className="app-root">
      <NavBar 
        user={user} 
        onSignOut={signOut} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        onNavigate={(page) => setView(page)}
        currentView={view}
        onSwitchAccount={switchAccountType}
      />
      <main className="app-main">
        {user ? (
          <>
            {view === 'reports' ? (
              <Reports currentUser={user} token={token} />
            ) : view === 'settings' ? (
              <Settings currentUser={user} token={token} onUpdateUser={(u) => setUser(u)} />
            ) : (
              <DashboardEnhanced currentUser={user} token={token} />
            )}
          </>
        ) : (
          <div>
            {view === 'landing' ? (
              <div className="auth-shell"><Landing onSignUp={switchToSignUp} onSignIn={switchToSignIn} /></div>
            ) : (
              <div className="auth-shell">
                {view==='signin' ? (
                  <SignIn
                    onSignedIn={onSignedIn}
                    onSwitchToSignUp={switchToSignUp}
                    onSwitchBack={switchToLanding}
                    onToast={showToast}
                  />
                ) : (
                  <SignUp
                    onSignedUp={onSignedUp}
                    onSwitchToSignIn={switchToSignIn}
                    onSwitchBack={switchToLanding}
                    onToast={showToast}
                  />
                )} 
              </div>
            )}
          </div>
        )}
      </main>
      <AstraChat currentUser={user} />
      <footer className="app-footer">© {new Date().getFullYear()} SpendWise — Built with care</footer>
      <Toast toast={toast} />
    </div>
  )
}
