import React, {useEffect, useState} from 'react'
import apiUrl from './api'
const FinanceChart = React.lazy(()=>import('./FinanceChart'))

export default function Dashboard({currentUser, token}){
  const [users,setUsers] = useState([])
  const [status,setStatus] = useState('')
  const [finance,setFinance] = useState({incomes:[], expenses:[], investments:[], totalIncome:0, totalExpense:0, totalInvestment:0, net:0})
  const [usersLoading, setUsersLoading] = useState(false)
  const [financeLoading, setFinanceLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState({})
  const [showMembers, setShowMembers] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  useEffect(()=>{ fetchUsers() },[])
  useEffect(()=>{ fetchFinance() },[])

  async function fetchUsers(){
    setUsersLoading(true)
    setError('')
    try{
      const headers = token ? { 'Authorization': 'Bearer '+token } : {}
      const res = await fetch(apiUrl('/api/users'), { headers })
      if (!res.ok) throw new Error('Failed to load users: '+res.status)
      const data = await res.json()
      setUsers(data)
    }catch(e){ setError('Failed to load users: '+e.message) }
    setUsersLoading(false)
  }

  async function handleSubmit(e){
    e.preventDefault()
    // prevent creating users if current account is individual (safety on frontend)
    if (!currentUser || currentUser.accountType !== 'group'){
      setStatus('Adding users is only available for group accounts')
      return
    }
    const form = e.target
    const payload = { name: form.name.value, email: form.email.value, monthlyIncome: Number(form.monthlyIncome.value) }
    try{
      const headers = {'Content-Type':'application/json'}
      if (token) headers['Authorization'] = 'Bearer '+token
      const res = await fetch(apiUrl('/api/users'),{ method:'POST', headers, body:JSON.stringify(payload) })
      if (!res.ok) {
        const txt = await res.text().catch(()=>res.statusText)
        throw new Error('Create failed: '+txt)
      }
      form.reset()
      fetchUsers()
      setStatus('User created')
      setShowAddMember(false)
      setTimeout(() => setStatus(''), 2000)
    }catch(err){ setStatus('Error: '+err.message) }
  }

  async function fetchFinance(){
    setFinanceLoading(true)
    setError('')
    try{
      const headers = token ? { 'Authorization': 'Bearer '+token, 'Cache-Control': 'no-cache' } : { 'Cache-Control': 'no-cache' }
      // Add timestamp to prevent caching
      const res = await fetch(apiUrl('/api/finance/summary?t=' + Date.now()), { headers, cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load finance: '+res.status)
      const data = await res.json()
      setFinance(data)
    }catch(e){ setError('Failed to load finance: '+e.message) }
    setFinanceLoading(false)
  }

  const totalUsers = users.length
  const avgIncome = users.length ? (users.reduce((s,u)=>s+Number(u.monthlyIncome||0),0)/users.length) : 0

  async function handleAdd(type, e){
    e.preventDefault()
    const form = e.target
    const payload = { 
      amount: Number(form.amount.value), 
      description: form.description.value, 
      date: form.date.value || undefined
    }
    // Add category if it's an expense
    if (type === 'expenses' && form.category) {
      payload.category = form.category.value
    }
    try{
      const headers = {'Content-Type':'application/json'}
      if (token) headers['Authorization'] = 'Bearer '+token
      const res = await fetch(apiUrl('/api/finance/'+type), { method:'POST', headers, body:JSON.stringify(payload) })
      if (!res.ok) {
        const txt = await res.text().catch(()=>res.statusText)
        throw new Error('Create failed: '+txt)
      }
      form.reset()
      await fetchFinance() // Wait for finance data to refresh
      setStatus(type.charAt(0).toUpperCase()+type.slice(1)+' added successfully!')
      setTimeout(() => setStatus(''), 3000)
    }catch(err){ 
      setStatus('Error: '+err.message)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  async function handleDelete(type, id){
    if (!confirm('Delete this record?')) return
    try{
      const headers = {}
      if (token) headers['Authorization'] = 'Bearer '+token
      const res = await fetch(apiUrl('/api/finance/'+type+'/'+id), { method:'DELETE', headers })
      if (!res.ok) throw new Error('Delete failed: '+(await res.text().catch(()=>res.statusText)))
      await fetchFinance() // Wait for finance data to refresh
      setStatus('Deleted successfully!')
      setTimeout(() => setStatus(''), 3000)
    }catch(err){ 
      setStatus('Error: '+err.message)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  function startEdit(type, item){
    setEditing(prev=> ({...prev, [type+'_'+item.id]: item}))
  }

  async function saveEdit(type, id){
    const key = type+'_'+id
    const item = editing[key]
    if (!item) return
    try{
      const headers = {'Content-Type':'application/json'}
      if (token) headers['Authorization'] = 'Bearer '+token
      const payload = { amount: Number(item.amount), description: item.description, date: item.date }
      // Validation: amount must be a positive number
      if (isNaN(payload.amount) || payload.amount <= 0){
        setStatus('Amount must be a positive number')
        setTimeout(() => setStatus(''), 3000)
        return
      }
      const res = await fetch(apiUrl('/api/finance/'+type+'/'+id), { method:'PUT', headers, body:JSON.stringify(payload) })
      if (!res.ok) throw new Error('Update failed: '+(await res.text().catch(()=>res.statusText)))
      setEditing(prev=>{ const copy={...prev}; delete copy[key]; return copy })
      await fetchFinance() // Wait for finance data to refresh
      setStatus('Updated successfully!')
      setTimeout(() => setStatus(''), 3000)
    }catch(err){ 
      setStatus('Error: '+err.message)
      setTimeout(() => setStatus(''), 3000)
    }
  }

  function cancelEdit(type,id){
    const key = type+'_'+id
    setEditing(prev=>{ const copy={...prev}; delete copy[key]; return copy })
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <div className="header-meta">
          <div className="meta-item">
            <div className="meta-value">{totalUsers}</div>
            <div className="meta-label">Users</div>
          </div>
          <div className="meta-item">
            <div className="meta-value">₹{avgIncome.toFixed(2)}</div>
            <div className="meta-label">Avg Monthly Income</div>
          </div>
          {currentUser && currentUser.accountType === 'group' && (
            <div className="meta-item members-dropdown">
              <button 
                className="members-toggle" 
                onClick={() => setShowMembers(!showMembers)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                👥 Members ({totalUsers})
                <span style={{transform: showMembers ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s'}}>▼</span>
              </button>
              {showMembers && (
                <div 
                  className="members-list"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    minWidth: '280px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    zIndex: 100
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '2px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <span style={{fontWeight: '700', fontSize: '14px', color: 'white'}}>Group Members</span>
                    <button
                      onClick={() => setShowAddMember(!showAddMember)}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      + Add Member
                    </button>
                  </div>
                  
                  {showAddMember && (
                    <form onSubmit={handleSubmit} style={{padding: '16px', borderBottom: '2px solid #f1f5f9', background: '#f8fafc'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <input 
                          name="name" 
                          placeholder="Full name" 
                          required 
                          style={{
                            padding: '10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        />
                        <input 
                          name="email" 
                          type="email" 
                          placeholder="email@domain.com" 
                          required 
                          style={{
                            padding: '10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        />
                        <input 
                          name="monthlyIncome" 
                          type="number" 
                          placeholder="Monthly income" 
                          required 
                          style={{
                            padding: '10px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        />
                        <button 
                          type="submit"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          Create Member
                        </button>
                      </div>
                      {status && <div style={{marginTop: '8px', fontSize: '12px', color: status.includes('Error') ? '#ef4444' : '#10b981'}}>{status}</div>}
                    </form>
                  )}
                  
                  {usersLoading ? (
                    <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>
                  ) : users.length === 0 ? (
                    <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No members</div>
                  ) : (
                    users.map(u => (
                      <div 
                        key={u.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'background 0.2s',
                          cursor: 'default'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <div style={{fontWeight: '600', color: '#1e293b', fontSize: '14px'}}>{u.name}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{u.email}</div>
                        <div style={{fontSize: '13px', color: '#667eea', fontWeight: '600'}}>₹{Number(u.monthlyIncome).toFixed(2)}/month</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card finance-card">
          <div className="card-header"><h3>💰 Finance Summary</h3></div>
          {financeLoading ? <div className="spinner"/> : (
          <div className="finance-body">
            <div className="finance-grid">
              <div className="finance-stat income-stat">
                <div className="stat-icon">📈</div>
                <div>
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value">₹{Number(finance.totalIncome||0).toFixed(2)}</div>
                </div>
              </div>
              <div className="finance-stat expense-stat">
                <div className="stat-icon">💸</div>
                <div>
                  <div className="stat-label">Total Expense</div>
                  <div className="stat-value">₹{Number(finance.totalExpense||0).toFixed(2)}</div>
                </div>
              </div>
              <div className="finance-stat investment-stat">
                <div className="stat-icon">💎</div>
                <div>
                  <div className="stat-label">Total Investment</div>
                  <div className="stat-value">₹{Number(finance.totalInvestment||0).toFixed(2)}</div>
                </div>
              </div>
              <div className="finance-stat net-stat">
                <div className="stat-icon">{Number(finance.net||0) >= 0 ? '✅' : '⚠️'}</div>
                <div>
                  <div className="stat-label">Net</div>
                  <div className="stat-value" style={{color: Number(finance.net||0) >= 0 ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'}}>₹{Number(finance.net||0).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="recent-lists" style={{marginTop:20}}>
              <h4 style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><span>💵</span> Recent Incomes</h4>
              <div className="recent-block">
              {finance.incomes.length===0 ? <div className="muted">No incomes</div> : (
                finance.incomes.map(i=> {
                  const key = 'incomes_'+i.id
                  const isEditing = !!editing[key]
                  const item = editing[key] || i
                  return (
                    <div key={i.id} className="finance-row">
                      <div className="finance-row-amount">{isEditing ? <input type="number" step="0.01" value={item.amount} onChange={e=>setEditing(prev=>({...prev,[key]:{...prev[key],amount:e.target.value}}))}/> : '₹'+Number(i.amount).toFixed(2)}</div>
                      <div className="finance-row-meta">
                        {isEditing ? (
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input value={item.description||''} onChange={e=>setEditing(prev=>({...prev,[key]:{...prev[key],description:e.target.value}}))} placeholder="Description" />
                            <input type="date" value={item.date||''} onChange={e=>setEditing(prev=>({...prev,[key]:{...prev[key],date:e.target.value}}))} />
                          </div>
                        ) : (
                          (i.description||'') + (i.date ? (' • '+i.date) : '')
                        )}
                      </div>
                      <div style={{marginLeft:'auto'}}>
                        {isEditing ? (
                          <>
                            <button className="btn-ghost" onClick={()=>saveEdit('incomes', i.id)}>Save</button>
                            <button className="btn-ghost" onClick={()=>cancelEdit('incomes', i.id)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-ghost" onClick={()=>startEdit('incomes', i)}>Edit</button>
                            <button className="btn-ghost" onClick={()=>handleDelete('incomes', i.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              </div>

              <h4 style={{marginTop:20,display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><span>🛒</span> Recent Expenses</h4>
              <div className="recent-block">
              {finance.expenses.length===0 ? <div className="muted">No expenses</div> : (
                finance.expenses.map(e=> {
                  const key = 'expenses_'+e.id
                  const isEditing = !!editing[key]
                  const item = editing[key] || e
                  return (
                    <div key={e.id} className="finance-row">
                      <div className="finance-row-amount">{isEditing ? <input type="number" step="0.01" value={item.amount} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],amount:ev.target.value}}))}/> : '₹'+Number(e.amount).toFixed(2)}</div>
                      <div className="finance-row-meta">
                        {isEditing ? (
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input value={item.description||''} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],description:ev.target.value}}))} placeholder="Description" />
                            <input type="date" value={item.date||''} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],date:ev.target.value}}))} />
                          </div>
                        ) : (
                          (e.description||'') + (e.date ? (' • '+e.date) : '')
                        )}
                      </div>
                      <div style={{marginLeft:'auto'}}>
                        {isEditing ? (
                          <>
                            <button className="btn-ghost" onClick={()=>saveEdit('expenses', e.id)}>Save</button>
                            <button className="btn-ghost" onClick={()=>cancelEdit('expenses', e.id)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-ghost" onClick={()=>startEdit('expenses', e)}>Edit</button>
                            <button className="btn-ghost" onClick={()=>handleDelete('expenses', e.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              </div>

              <h4 style={{marginTop:20,display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><span>🚀</span> Recent Investments</h4>
              <div className="recent-block">
              {finance.investments.length===0 ? <div className="muted">No investments</div> : (
                finance.investments.map(inv=> {
                  const key = 'investments_'+inv.id
                  const isEditing = !!editing[key]
                  const item = editing[key] || inv
                  return (
                    <div key={inv.id} className="finance-row">
                      <div className="finance-row-amount">{isEditing ? <input type="number" step="0.01" value={item.amount} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],amount:ev.target.value}}))}/> : '₹'+Number(inv.amount).toFixed(2)}</div>
                      <div className="finance-row-meta">
                        {isEditing ? (
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <input value={item.description||''} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],description:ev.target.value}}))} placeholder="Description" />
                            <input type="date" value={item.date||''} onChange={ev=>setEditing(prev=>({...prev,[key]:{...prev[key],date:ev.target.value}}))} />
                          </div>
                        ) : (
                          (inv.description||'') + (inv.date ? (' • '+inv.date) : '')
                        )}
                      </div>
                      <div style={{marginLeft:'auto'}}>
                        {isEditing ? (
                          <>
                            <button className="btn-ghost" onClick={()=>saveEdit('investments', inv.id)}>Save</button>
                            <button className="btn-ghost" onClick={()=>cancelEdit('investments', inv.id)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn-ghost" onClick={()=>startEdit('investments', inv)}>Edit</button>
                            <button className="btn-ghost" onClick={()=>handleDelete('investments', inv.id)}>Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              </div>
            </div>
          </div>
          )}
        </section>

        <section className="card activity-card">
          <h3>📈 Trending Stocks</h3>
          <div style={{padding: '16px 0'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {[
                {symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,847.50', change: '+2.3%', changeColor: '#10b981'},
                {symbol: 'TCS', name: 'Tata Consultancy', price: '₹3,654.20', change: '+1.8%', changeColor: '#10b981'},
                {symbol: 'INFY', name: 'Infosys', price: '₹1,523.40', change: '-0.5%', changeColor: '#ef4444'},
                {symbol: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,687.90', change: '+0.9%', changeColor: '#10b981'},
                {symbol: 'ICICIBANK', name: 'ICICI Bank', price: '₹1,134.75', change: '+1.2%', changeColor: '#10b981'}
              ].map((stock, i) => (
                <div 
                  key={i}
                  className="stock-item"
                >
                  <div>
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-name">{stock.name}</div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div className="stock-price">{stock.price}</div>
                    <div style={{fontSize: '12px', fontWeight: '600', color: stock.changeColor}}>{stock.change}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="stock-disclaimer">
              <div style={{fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{fontSize: '16px'}}>⚠️</span>
                <span>Stock prices are indicative. Consult a financial advisor before investing.</span>
              </div>
            </div>
          </div>
        </section>

        <div className="add-row">
          <section className="card add-card">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}>💵 Add Income</h3>
            <form onSubmit={(e)=>handleAdd('incomes', e)} style={{display:'flex',flexDirection:'column',gap:8}}>
              <label className="form-field">Amount <input name="amount" type="number" step="0.01" placeholder="0.00" required /></label>
              <label className="form-field">Description <input name="description" placeholder="Description" /></label>
              <label className="form-field">Date <input name="date" type="date" /></label>
              <div style={{height:'60px'}}></div>
              <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn-primary" type="submit">Add Income</button></div>
            </form>
          </section>

          <section className="card add-card">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}>🛒 Add Expense</h3>
            <form onSubmit={(e)=>handleAdd('expenses', e)} style={{display:'flex',flexDirection:'column',gap:8}}>
              <label className="form-field">Amount <input name="amount" type="number" step="0.01" placeholder="0.00" required /></label>
              <label className="form-field">Description <input name="description" placeholder="Description" /></label>
              <label className="form-field">Date <input name="date" type="date" /></label>
              <label className="form-field">Category 
                <select name="category">
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn-primary" type="submit">Add Expense</button></div>
            </form>
          </section>

          <section className="card add-card">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}>🚀 Add Investment</h3>
            <form onSubmit={(e)=>handleAdd('investments', e)} style={{display:'flex',flexDirection:'column',gap:8}}>
              <label className="form-field">Amount <input name="amount" type="number" step="0.01" placeholder="0.00" required /></label>
              <label className="form-field">Description <input name="description" placeholder="Description" /></label>
              <label className="form-field">Date <input name="date" type="date" /></label>
              <div style={{height:'60px'}}></div>
              <div style={{display:'flex',justifyContent:'flex-end'}}><button className="btn-primary" type="submit">Add Investment</button></div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
