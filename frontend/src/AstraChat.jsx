import React, { useState, useRef, useEffect } from 'react'

export default function AstraChat({ currentUser }){
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const boxRef = useRef()
  const [imgError, setImgError] = useState(false)
  const [query, setQuery] = useState('')
  const [showStats, setShowStats] = useState(false)

  // expanded FAQ list with categories and suggested followups
  const faqs = [
    {cat:'Basics', q: 'How do I add an expense?', a: 'Use the Add Expense card: fill amount, description and date, then click Add Expense.' , followups: ['Can I split this expense?','How do I edit an expense?']},
    {cat:'Groups', q: 'How do I split an expense with my group?', a: 'When creating an expense as a group owner, the system will split it across members automatically.' , followups: ['How are remainders handled?','Can I edit the split?']},
    {cat:'Data', q: 'How can I export my data?', a: 'Reports export is planned. For now, use a DB dump or query your database directly.' , followups: ['Which tables to export?','Is there CSV export?']},
    {cat:'Accounts', q: 'How do I delete an entry?', a: 'Click Delete on the entry in Recent lists — deletions are permanent.' , followups: ['Can I recover deleted items?']},
    {cat:'Summary', q: 'What is Net in the summary?', a: 'Net = Total Income - Total Expense + Total Investment for the selected period.' , followups: ['How is monthly income included?']},
    {cat:'Groups', q: 'How do I invite members to my group?', a: 'Use the Add User form while signed in as a group owner to add members to your group.' , followups: ['How to remove a member?']},
    {cat:'Auth', q: 'Why was I logged out?', a: 'Tokens may expire or be cleared; re-sign-in to restore your session.' , followups: ['How long are tokens valid?']}
  ]

  const storageKey = currentUser ? `astra_history_${currentUser.id}` : 'astra_history_guest'
  const eventsKey = currentUser ? `astra_events_${currentUser.id}` : 'astra_events_guest'

  useEffect(()=>{
    // load history
    try{
      const raw = localStorage.getItem(storageKey)
      if (raw) setMessages(JSON.parse(raw))
      else setMessages([{from:'bot', text:"Hi, I'm Astra — your SpendWise assistant. Try the suggestions below or ask a question."}])
    }catch(e){ setMessages([{from:'bot', text:"Hi, I'm Astra — your SpendWise assistant."}]) }
  },[storageKey])

  useEffect(()=>{ if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight },[messages, open])

  useEffect(()=>{
    // persist history
    try{ localStorage.setItem(storageKey, JSON.stringify(messages)) }catch(e){}
  },[messages, storageKey])

  // close on Escape key when open
  useEffect(()=>{
    if (!open) return
    const onKey = (ev)=>{ if (ev.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[open])

  function pushMessage(msg){
    const withTs = { ...msg, ts: new Date().toISOString() }
    setMessages(m=>[...m, withTs])
  }

  // Analytics helpers (client-side only)
  function recordEvent(evt){
    try{
      const raw = localStorage.getItem(eventsKey) || '[]'
      const arr = JSON.parse(raw)
      arr.push({...evt, ts: new Date().toISOString()})
      localStorage.setItem(eventsKey, JSON.stringify(arr))
    }catch(e){ /* ignore */ }
  }

  function loadEvents(){
    try{ return JSON.parse(localStorage.getItem(eventsKey) || '[]') }catch(e){ return [] }
  }

  function computeStats(){
    const ev = loadEvents()
    const counts = {}
    ev.forEach(e=>{
      if (!e.key) return
      counts[e.key] = (counts[e.key]||0) + 1
    })
    return counts
  }

  function clearEvents(){
    try{ localStorage.removeItem(eventsKey) }catch(e){}
    // force re-render by toggling showStats briefly
    setShowStats(false)
    setTimeout(()=>setShowStats(true),20)
  }

  function answerText(text){
    const t = text.trim().toLowerCase()
    const found = faqs.find(f => f.q.toLowerCase().includes(t) || t.includes(f.q.toLowerCase()))
    if (found) return { text: found.a, source: 'faq', faq: found }
    // keyword routing
    if (t.includes('split') || t.includes('group')) return { text: faqs.find(f=>f.cat==='Groups').a, source: 'faq' }
    if (t.includes('export') || t.includes('csv')) return { text: faqs.find(f=>f.cat==='Data').a, source: 'faq' }
    if (t.includes('delete')) return { text: faqs.find(f=>f.cat==='Accounts').a, source: 'faq' }
    return null // No FAQ match, will call AI
  }

  async function askAI(question){
    try{
      const token = localStorage.getItem('token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 429 || errorData.error?.includes('Too Many Requests')) {
          return "🕒 Google AI rate limit reached. Please wait 2-3 minutes and try again. Free tier has tight limits!"
        }
        throw new Error('AI request failed')
      }
      const data = await res.json()
      return data.answer || "I'm having trouble answering that right now. Please try again."
    }catch(e){
      console.error('AI error:', e)
      return "I'm having trouble connecting right now. Try one of the FAQ suggestions below!"
    }
  }

  function handleFaqClick(f){
    pushMessage({from:'user', text:f.q})
    // record analytics: faq clicked
    recordEvent({ type:'faq_click', key: `faq:${f.q}`, q: f.q })
    setTyping(true)
    setTimeout(()=>{
      setTyping(false)
      pushMessage({from:'bot', text:f.a, followups: f.followups || []})
      // record that FAQ answer was shown (used)
      recordEvent({ type:'faq_used', key: `faq:${f.q}`, q: f.q })
    },500 + Math.random()*600)
  }

  function handleFollowupClick(text){
    setInput(text)
    // record analytics: followup clicked
    recordEvent({ type:'faq_followup', key: `followup:${text}`, q: text })
    // auto-send followup
    setTimeout(()=> sendInput(text), 120)
  }

  async function sendInput(t){
    if (!t || !t.trim()) return
    pushMessage({from:'user', text:t})
    setTyping(true)
    
    const faqAnswer = answerText(t)
    
    if (faqAnswer) {
      // FAQ match found
      setTimeout(()=>{
        setTyping(false)
        const followups = faqAnswer.faq ? faqAnswer.faq.followups : []
        if (faqAnswer.faq){ recordEvent({ type:'faq_used', key:`faq:${faqAnswer.faq.q}`, q: faqAnswer.faq.q }) }
        pushMessage({from:'bot', text:faqAnswer.text, followups})
      },600 + Math.random()*700)
    } else {
      // No FAQ match, call AI
      const aiAnswer = await askAI(t)
      setTyping(false)
      pushMessage({from:'bot', text:aiAnswer, source:'ai'})
      recordEvent({ type:'ai_query', key: `ai:${t.substring(0,50)}`, q: t })
    }
  }

  function handleSend(e){ e && e.preventDefault(); const t = input.trim(); if (!t) return; setInput(''); sendInput(t) }

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(query.trim().toLowerCase()) || f.cat.toLowerCase().includes(query.trim().toLowerCase()) || !query.trim())

  return (
    <div className={`astra-widget ${open ? 'open' : ''}`}>
      {!open && (
        <button className="astra-fab" onClick={()=>setOpen(true)} title="Ask Astra">
          {!imgError ? (
            <img src="/astra-logo.png" className="astra-logo-img" alt="Astra" onError={()=>setImgError(true)} />
          ) : (
            <svg className="astra-svg" viewBox="0 0 64 64" width="44" height="44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="4" y="10" width="56" height="44" rx="8" fill="#0fb1a6" />
              <rect x="12" y="18" width="40" height="28" rx="6" fill="#0a7f78" />
              <circle cx="26" cy="28" r="3" fill="#fff" />
              <circle cx="38" cy="28" r="3" fill="#fff" />
              <path d="M24 36c2 2 6 2 8 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </button>
      )}

      {open && (
        <div className="astra-panel" role="dialog" aria-label="Astra chat">
          <div className="astra-header">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:36,height:36,flex:'none'}}>
                <svg viewBox="0 0 64 64" width="36" height="36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="4" y="10" width="56" height="44" rx="8" fill="#0fb1a6" />
                </svg>
              </div>
              <div>
                <div className="astra-title">Astra <span className="beta">beta</span></div>
                <div className="astra-sub">Your SpendWise assistant</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input className="astra-search" placeholder="Search FAQs" value={query} onChange={e=>setQuery(e.target.value)} />
              <button className="astra-stats-btn" onClick={() => setShowStats(s => !s)} title="Show stats">📊</button>
              <button className="astra-close" onClick={()=>setOpen(false)} aria-label="Close">×</button>
            </div>
          </div>

          <div className="astra-body" ref={boxRef}>
            {messages.map((m,idx)=> (
              <div key={idx} className={`astra-msg ${m.from==='bot' ? 'bot' : 'user'}`}>
                <div className="astra-msg-meta">
                  <div className={`astra-avatar ${m.from==='bot'?'bot':'user'}`}>{m.from==='bot' ? 'A' : (currentUser ? (currentUser.name||'U')[0] : 'Y')}</div>
                  <div className="astra-ts">{m.ts ? new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ''}</div>
                  {m.source === 'ai' && <div className="astra-ai-badge" title="Powered by ChatGPT">🤖</div>}
                </div>
                <div className="astra-msg-text">{m.text}</div>
                {m.followups && m.followups.length>0 && (
                  <div className="astra-followups">
                    {m.followups.map((fup,i)=>(<button key={i} className="astra-chip" onClick={()=>handleFollowupClick(fup)}>{fup}</button>))}
                  </div>
                )}
              </div>
            ))}
            {typing && <div className="astra-msg bot"><div className="astra-msg-text">Astra is typing…</div></div>}
          </div>

          <div className="astra-suggestions">
            {filteredFaqs.slice(0,6).map((f,i)=>(
              <button key={i} className="astra-chip" onClick={()=>handleFaqClick(f)}>{f.q}</button>
            ))}
          </div>

          {showStats && (
            <div className="astra-stats">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <strong>FAQ Usage</strong>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={clearEvents} className="astra-chip">Clear</button>
                </div>
              </div>
              <div>
                {Object.entries(computeStats()).length === 0 && <div style={{opacity:0.7}}>No events yet — interact with FAQs to collect data.</div>}
                {Object.entries(computeStats()).sort((a,b)=>b[1]-a[1]).map(([k,v])=> (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid rgba(0,0,0,0.04)'}}>
                    <div style={{fontSize:13}}>{k.replace(/^faq:/,'').replace(/^followup:/,'↳ ')}</div>
                    <div style={{fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className="astra-input-row" onSubmit={handleSend}>
            <input placeholder="Ask Astra a question" value={input} onChange={e=>setInput(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}
