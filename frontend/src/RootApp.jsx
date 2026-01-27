import React, {useEffect, useState} from 'react'
import DashboardEnhanced from './DashboardEnhanced'
import Reports from './Reports'
import Settings from './Settings'
import SignIn from './SignIn'
import SignUp from './SignUp'
import NavBar from './components/NavBar'
import AstraChat from './AstraChat'
import Landing from './Landing'
import './index.css'

export default function RootApp(){
  const [user,setUser] = useState(null)
  const [token,setToken] = useState(localStorage.getItem('token') || null)
  const [view,setView] = useState('landing')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(()=>{
    if (token) {
      fetch('/api/auth/me',{headers:{'Authorization':'Bearer '+token}})
        .then(r=> r.ok ? r.json() : Promise.reject('no'))
        .then(d=> setUser(d))
        .catch(()=> { localStorage.removeItem('token'); setToken(null); setUser(null); })
    }
  },[token])

  useEffect(()=>{
    try{
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }catch(e){}
  },[theme])

  function toggleTheme(){ setTheme(t => t === 'light' ? 'dark' : 'light') }

  function onSignedIn(u,t){ setUser(u); setToken(t); setView('dashboard') }
  function onSignedUp(u,t){ setUser(u); setToken(t); setView('dashboard') }

  function switchToSignUp(){ setView('signup') }
  function switchToSignIn(){ setView('signin') }
  function switchToLanding(){ setView('landing') }
  function switchToReports(){ setView('reports') }
  function switchToDashboard(){ setView('dashboard') }

  function signOut(){ localStorage.removeItem('token'); setToken(null); setUser(null); setView('signin') }

  return (
    <div className="app-root">
      <NavBar 
        user={user} 
        onSignOut={signOut} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        onNavigate={(page) => setView(page)}
        currentView={view}
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
                {view==='signin' ? <SignIn onSignedIn={onSignedIn} onSwitchToSignUp={switchToSignUp} onSwitchBack={switchToLanding}/> : <SignUp onSignedUp={onSignedUp} onSwitchToSignIn={switchToSignIn} onSwitchBack={switchToLanding}/>} 
              </div>
            )}
          </div>
        )}
      </main>
      <AstraChat currentUser={user} />
      <footer className="app-footer">© {new Date().getFullYear()} SpendWise — Built with care</footer>
    </div>
  )
}
