import React, {useState, useRef, useEffect, useMemo} from 'react'
import apiUrl from './api'

export default function SignUp({onSignedUp, onSwitchToSignIn, onSwitchBack}){
  const [status,setStatus] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [passwordDraft, setPasswordDraft] = useState('')
  const formRef = useRef(null)
  const unique = useMemo(()=>Math.random().toString(36).slice(2,9),[])
  const nameField = `name_${unique}`
  const emailField = `email_${unique}`
  const passwordField = `password_${unique}`

  useEffect(()=>{
    if (formRef.current) formRef.current.reset()
    setStatus('')
    setEmailDraft('')
    setPasswordDraft('')
  }, [])

  function isValidGmailWithNumber(emailRaw){
    const email = (emailRaw || '').trim()
    // requirements: must contain @, end with gmail.com, and contain at least one digit before @
    return /^[^\s@]*\d[^\s@]*@gmail\.com$/i.test(email)
  }

  function passwordStrength(pwRaw){
    const pw = pwRaw || ''
    const hasLower = /[a-z]/.test(pw)
    const hasUpper = /[A-Z]/.test(pw)
    const hasDigit = /\d/.test(pw)
    const hasSymbol = /[^A-Za-z0-9]/.test(pw)
    const len = pw.length

    let score = 0
    if (len >= 8) score += 1
    if (len >= 12) score += 1
    if (hasLower) score += 1
    if (hasUpper) score += 1
    if (hasDigit) score += 1
    if (hasSymbol) score += 1

    if (!pw) return { label: '', level: 0 }
    if (score <= 2) return { label: 'Weak', level: 1 }
    if (score <= 4) return { label: 'Moderate', level: 2 }
    return { label: 'Hard', level: 3 }
  }

  const strength = passwordStrength(passwordDraft)

  async function submitSignUp(payload){
    const res = await fetch(apiUrl('/api/auth/signup'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    localStorage.setItem('token', data.token)
    onSignedUp(data.user, data.token)
  }

  async function handleSocialSignUp(providerLabel){
    const name = window.prompt(`${providerLabel} sign up:\nEnter your name`) || ''
    if (!name.trim()) return
    const email = window.prompt(`${providerLabel} sign up:\nEnter your Gmail (must include a number).\nExample: name123@gmail.com`, emailDraft || '') || ''
    if (!email.trim()) return
    const password = window.prompt(`${providerLabel} sign up:\nCreate a password (minimum 8 characters)`) || ''
    if (!password) return

    if (!isValidGmailWithNumber(email)) {
      setStatus('Error: Email must be a Gmail address and contain at least one number (example: name123@gmail.com).')
      return
    }
    if (password.length < 8) {
      setStatus('Error: Password must be at least 8 characters.')
      return
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      monthlyIncome: 0,
      accountType: 'individual'
    }

    try {
      await submitSignUp(payload)
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  async function handle(e){
    e.preventDefault()
    const f = e.target
    // Access fields by their dynamic names to match input attributes
    const email = f.elements[emailField].value
    const password = f.elements[passwordField].value

    if (!isValidGmailWithNumber(email)) {
      setStatus('Error: Email must be a Gmail address and contain at least one number (example: name123@gmail.com).')
      return
    }

    if (!password || password.length < 8) {
      setStatus('Error: Password must be at least 8 characters.')
      return
    }

    const payload = {
      name: f.elements[nameField].value,
      email,
      password,
      monthlyIncome: Number(f.elements.monthlyIncome.value),
      accountType: f.elements.accountType.value
    }
    try{
      await submitSignUp(payload)
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
            <button className="social-btn" type="button" onClick={() => handleSocialSignUp('Facebook')}>f</button>
            <button className="social-btn" type="button" onClick={() => handleSocialSignUp('Google')}>G+</button>
            <button className="social-btn" type="button" onClick={() => handleSocialSignUp('LinkedIn')}>in</button>
          </div>
          <div className="muted" style={{marginBottom:12}}>or use your email for registration</div>
          {status && <div style={{color:'#c00',marginBottom:10}}>{status}</div>}
          <form ref={formRef} onSubmit={handle} autoComplete="off">
            <div className="form-field"><input name={nameField} placeholder="Name" autoComplete="off" required/></div>
            <div className="form-field">
              <input
                name={emailField}
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
            <div className="form-field">
              <input
                name={passwordField}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                onChange={(e) => { setPasswordDraft(e.target.value); if (status) setStatus('') }}
                required
              />
              {strength.label && (
                <div className="pw-meter" aria-label={`Password strength: ${strength.label}`}>
                  <div className="pw-meter-row">
                    <div className={`pw-meter-bar level-${strength.level}`}>
                      <span className="pw-meter-fill" style={{width: `${(strength.level/3)*100}%`}} />
                    </div>
                    <div className={`pw-meter-label level-${strength.level}`}>{strength.label}</div>
                  </div>
                </div>
              )}
            </div>
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
