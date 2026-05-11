import React from 'react'
import BudgetAlerts from './BudgetAlerts'
import ExportReports from './ExportReports'

export default function Reports({currentUser, token}){
  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <h1>Reports</h1>
      </div>

      <section className="card wide" style={{marginBottom:20}}>
        <ExportReports token={token} />
      </section>

      <section className="card wide">
        <h3>Budget Tracker</h3>
        <div className="placeholder">
          <div style={{width:'100%', maxWidth:960}}>
            <BudgetAlerts token={token} />
          </div>
          <div style={{marginTop:12}}>More detailed reports and analytics will be added here.</div>
        </div>
      </section>
    </div>
  )
}
