import React, {useState, useRef, useEffect, useMemo} from 'react'
import apiUrl from './api'

export default function SignIn({onSignedIn, onSwitchToSignUp, onSwitchBack}){
  const [status,setStatus] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const formRef = useRef(null)
  const unique = useMemo(()=>Math.random().toString(36).slice(2,9),[])
  const emailName = `email_${unique}`
  const passwordName = `password_${unique}`

  useEffect(()=>{
    // Clear previous values when the form mounts
    if (formRef.current) formRef.current.reset()
    setStatus('')
    setEmailDraft('')
  }, [])

  function isValidGmailWithNumber(emailRaw){
    const email = (emailRaw || '').trim()
    return /^[^\s@]*\d[^\s@]*@gmail\.com$/i.test(email)
  }

  async function submitSignIn(email, password){
    const payload = { email, password }
    const res = await fetch(apiUrl('/api/auth/signin'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    localStorage.setItem('token', data.token)
    onSignedIn(data.user, data.token)
  }

  async function handleSocialSignIn(providerLabel){
    const email = window.prompt(`${providerLabel} sign in:\nEnter your Gmail (must include a number).\nExample: name123@gmail.com`, emailDraft || '')
    if (!email) return
    const password = window.prompt(`${providerLabel} sign in:\nEnter your password`)
    if (!password) return

    if (!isValidGmailWithNumber(email)) {
      setStatus('Error: Email must be a Gmail address and contain at least one number (example: name123@gmail.com).')
      return
    }

    try {
      await submitSignIn(email.trim(), password)
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  async function handle(e){
    e.preventDefault()
    const f = e.target
    // form inputs use dynamic names to avoid autofill; access via elements
    const email = f.elements[emailName].value
    const password = f.elements[passwordName].value

    if (!isValidGmailWithNumber(email)) {
      setStatus('Error: Email must be a Gmail address and contain at least one number (example: name123@gmail.com).')
      return
    }

    try{
      await submitSignIn(email, password)
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
            <button className="social-btn" type="button" onClick={() => handleSocialSignIn('Facebook')}>f</button>
            <button className="social-btn" type="button" onClick={() => handleSocialSignIn('Google')}>G+</button>
            <button className="social-btn" type="button" onClick={() => handleSocialSignIn('LinkedIn')}>in</button>
          </div>
          <div className="muted" style={{marginBottom:12}}>or use your email</div>
          {status && <div style={{color:'#c00',marginBottom:10}}>{status}</div>}
          <form ref={formRef} onSubmit={handle} autoComplete="off">
            <div className="form-field">
              <input
                name={emailName}
                type="email"
                placeholder="Email (example: name123@gmail.com)"
                autoComplete="off"
                onChange={(e) => { setEmailDraft(e.target.value); if (status) setStatus('') }}
                required
              />
              {emailDraft && !isValidGmailWithNumber(emailDraft) && (
                <div className="field-hint error-text">Use a Gmail address with at least one number (example: name123@gmail.com).</div>
              )}
            </div>
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
