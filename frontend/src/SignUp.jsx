import React, {useState, useRef, useEffect, useMemo} from 'react'import apiUrl from './api'
export default function SignUp({onSignedUp, onSwitchToSignIn, onSwitchBack}){
  const [status,setStatus] = useState('')
  const formRef = useRef(null)
  const unique = useMemo(()=>Math.random().toString(36).slice(2,9),[])
  const nameField = `name_${unique}`
  const emailField = `email_${unique}`
  const passwordField = `password_${unique}`

  useEffect(()=>{
    if (formRef.current) formRef.current.reset()
    setStatus('')
  }, [])

  async function handle(e){
    e.preventDefault()
    const f = e.target
    // Access fields by their dynamic names to match input attributes
    const payload = {
      name: f.elements[nameField].value,
      email: f.elements[emailField].value,
      password: f.elements[passwordField].value,
      monthlyIncome: Number(f.elements.monthlyIncome.value),
      accountType: f.elements.accountType.value
    }
    try{
      const res = await fetch(apiUrl('/api/auth/signup'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      localStorage.setItem('token', data.token)
      onSignedUp(data.user, data.token)
    }catch(err){ setStatus('Error: '+err.message) }
  }

  return (
    <div className="auth-card">
      <div className="auth-panel auth-left">
        <div className="auth-inner">
          <h2>Welcome Back!</h2>
          <p className="lead">If you already have an account, sign in to continue</p>
          <div style={{marginTop:18}}>
            <button className="btn-ghost" type="button" onClick={() => onSwitchToSignIn && onSwitchToSignIn()}>SIGN IN</button>
          </div>
        </div>
      </div>

      <div className="auth-panel auth-right">
        <div className="auth-inner">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <h2>Create Account</h2>
            <div>
              <button className="btn-ghost small" type="button" onClick={() => onSwitchBack && onSwitchBack()}>Back</button>
            </div>
          </div>
          <div className="social-row">
            <button className="social-btn">f</button>
            <button className="social-btn">G+</button>
            <button className="social-btn">in</button>
          </div>
          <div className="muted" style={{marginBottom:12}}>or use your email for registration</div>
          {status && <div style={{color:'#c00',marginBottom:10}}>{status}</div>}
          <form ref={formRef} onSubmit={handle} autoComplete="off">
            <div className="form-field"><input name={nameField} placeholder="Name" autoComplete="off" required/></div>
            <div className="form-field"><input name={emailField} type="email" placeholder="Email" autoComplete="off" required/></div>
            <div className="form-field"><input name={passwordField} type="password" placeholder="Password" autoComplete="new-password" required/></div>
            <div className="form-field"><input name="monthlyIncome" type="number" placeholder="Monthly Income" required/></div>
            <div className="form-field"><select name="accountType" defaultValue="individual"><option value="individual">Individual</option><option value="group">Group</option></select></div>
            <div style={{marginTop:10}}>
              <button className="btn-primary" type="submit">SIGN UP</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
