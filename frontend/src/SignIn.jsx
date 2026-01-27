import React, {useState, useRef, useEffect, useMemo} from 'react'

export default function SignIn({onSignedIn, onSwitchToSignUp, onSwitchBack}){
  const [status,setStatus] = useState('')
  const formRef = useRef(null)
  const unique = useMemo(()=>Math.random().toString(36).slice(2,9),[])
  const emailName = `email_${unique}`
  const passwordName = `password_${unique}`

  useEffect(()=>{
    // Clear previous values when the form mounts
    if (formRef.current) formRef.current.reset()
    setStatus('')
  }, [])

  async function handle(e){
    e.preventDefault()
    const f = e.target
    // form inputs use dynamic names to avoid autofill; access via elements
    const payload = { email: f.elements[emailName].value, password: f.elements[passwordName].value }
    try{
      const res = await fetch('/api/auth/signin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      localStorage.setItem('token', data.token)
      onSignedIn(data.user, data.token)
    }catch(err){ setStatus('Error: '+err.message) }
  }

  return (
    <div className="auth-card">
      <div className="auth-panel auth-left">
        <div className="auth-inner">
          <h2>Welcome Back!</h2>
          <p className="lead">To keep connected with us please login with your personal info</p>
          <div style={{marginTop:18}}>
            <button className="btn-ghost" type="button" onClick={() => onSwitchToSignUp && onSwitchToSignUp()}>SIGN UP</button>
          </div>
        </div>
      </div>

      <div className="auth-panel auth-right">
        <div className="auth-inner">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <h2>Sign in</h2>
            <div>
              <button className="btn-ghost small" type="button" onClick={() => onSwitchBack && onSwitchBack()}>Back</button>
            </div>
          </div>
          <div className="social-row">
            <button className="social-btn">f</button>
            <button className="social-btn">G+</button>
            <button className="social-btn">in</button>
          </div>
          <div className="muted" style={{marginBottom:12}}>or use your email</div>
          {status && <div style={{color:'#c00',marginBottom:10}}>{status}</div>}
          <form ref={formRef} onSubmit={handle} autoComplete="off">
            <div className="form-field"><input name={emailName} type="email" placeholder="Email" autoComplete="off" required/></div>
            <div className="form-field"><input name={passwordName} type="password" placeholder="Password" autoComplete="new-password" required/></div>
            <div style={{marginTop:10}}>
              <div className="help">Forgot your password?</div>
              <div style={{marginTop:18}}><button className="btn-primary" type="submit">LOGIN</button></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
