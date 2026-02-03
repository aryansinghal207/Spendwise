import React, {useEffect, useState} from 'react'
import apiUrl from './api'
import DashboardEnhanced from './DashboardEnhanced'
import SignIn from './SignIn'
import SignUp from './SignUp'
import AstraChat from './AstraChat'

export default function App(){
  const [user,setUser] = useState(null)
  const [token,setToken] = useState(localStorage.getItem('token') || null)
  const [view,setView] = useState('signin')

  useEffect(()=>{
    if (token) {
      fetch(apiUrl('/api/auth/me'),{headers:{'Authorization':'Bearer '+token}})
        .then(r=> r.ok ? r.json() : Promise.reject('no'))
        .then(d=> setUser(d))
        .catch(()=> { localStorage.removeItem('token'); setToken(null); setUser(null); })
    }
  },[token])

  function onSignedIn(u,t){ setUser(u); setToken(t); setView('dashboard') }
  function onSignedUp(u,t){ setUser(u); setToken(t); setView('dashboard') }

  function signOut(){ localStorage.removeItem('token'); setToken(null); setUser(null); setView('signin') }

  if (user) {
    return (
      <div>
        <div style={{background:'#f5f5f5',padding:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{marginLeft:12,fontWeight:700}}>SpendWise</div>
          <div style={{marginRight:12}}>
            <span style={{marginRight:12}}>{user.name} ({user.accountType})</span>
            <button onClick={signOut}>Sign out</button>
          </div>
        </div>
        <DashboardEnhanced currentUser={user} token={token} />
        <AstraChat currentUser={user} />
      </div>
    )
  }

  return (
    <div>
      <div style={{background:'#f5f5f5',padding:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{marginLeft:12,fontWeight:700}}>SpendWise</div>
        <div style={{marginRight:12}}>
          <button onClick={()=>setView('signin')} style={{marginRight:8}}>Sign In</button>
          <button onClick={()=>setView('signup')}>Sign Up</button>
        </div>
      </div>
      {view==='signin' ? <SignIn onSignedIn={onSignedIn}/> : <SignUp onSignedUp={onSignedUp}/>} 
      <AstraChat currentUser={null} />
    </div>
  )
}
