import React, {useEffect, useState} from 'react'
const FinanceChart = React.lazy(()=>import('./FinanceChart'))

export default function Reports({currentUser, token}){
  const [finance,setFinance] = useState({incomes:[], expenses:[], investments:[], totalIncome:0, totalExpense:0, totalInvestment:0, net:0})
  const [financeLoading, setFinanceLoading] = useState(false)

  useEffect(()=>{ fetchFinance() },[])

  async function fetchFinance(){
    setFinanceLoading(true)
    try{
      const headers = token ? { 'Authorization': 'Bearer '+token } : {}
      const res = await fetch('/api/finance/summary', { headers })
      if (!res.ok) throw new Error('Failed to load finance: '+res.status)
      const data = await res.json()
      setFinance(data)
    }catch(e){ console.error('Failed to load finance:', e) }
    setFinanceLoading(false)
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <h1>Reports</h1>
      </div>

      <section className="card wide">
        <h3>Activity & Financial Charts</h3>
        <div className="placeholder">
          {financeLoading ? (
            <div>Loading charts...</div>
          ) : (
            <div style={{maxWidth:960}}>
              <React.Suspense fallback={<div>Loading chart...</div>}>
                <FinanceChart incomes={finance.incomes||[]} expenses={finance.expenses||[]} />
              </React.Suspense>
            </div>
          )}
          <div style={{marginTop:12}}>Detailed financial reports and analytics will appear here.</div>
        </div>
      </section>
    </div>
  )
}
