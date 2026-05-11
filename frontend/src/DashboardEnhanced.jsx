import React, { useState } from 'react'
import HealthScore from './HealthScore'
import CategoryChart from './CategoryChart'
import Milestones from './Milestones'
import ReceiptScanner from './ReceiptScanner'
import BudgetAlerts from './BudgetAlerts'
import ExportReports from './ExportReports'
import ThemeCustomizer from './ThemeCustomizer'

const OriginalDashboard = React.lazy(() => import('./Dashboard'))

export default function DashboardEnhanced({ currentUser, token }) {
  const [showEnhanced, setShowEnhanced] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!showEnhanced) {
    return (
      <div>
        <button 
          onClick={() => setShowEnhanced(true)}
          style={{
            position: 'fixed',
            top: '80px',
            left: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 1000,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          ✨ Show Enhanced Features
        </button>
        <React.Suspense fallback={<div>Loading...</div>}>
          <OriginalDashboard currentUser={currentUser} token={token} />
        </React.Suspense>
      </div>
    )
  }

  return (
    <div className="dashboard-root">
      <ThemeCustomizer />
      
      <div className="dashboard-header">
        <h1>Enhanced Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleRefresh}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => setShowEnhanced(false)}
            style={{
              padding: '10px 20px',
              background: 'var(--muted)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📊 Classic View
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        {/* Top Row - Health Score and Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <HealthScore key={`health_${refreshKey}`} token={token} />
          <ExportReports key={`export_${refreshKey}`} token={token} />
        </div>

        {/* Second Row - Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <CategoryChart key={`cat_${refreshKey}`} token={token} />
          <BudgetAlerts key={`budget_${refreshKey}`} token={token} />
        </div>

        {/* Fourth Row - Budget and Goals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', margin: '20px 0' }}>
          <Milestones key={`milestones_${refreshKey}`} token={token} />
        </div>

        {/* Fifth Row - Receipt Scanner */}
        <ReceiptScanner token={token} onExpenseCreated={handleRefresh} />

        {/* Original Dashboard Content */}
        <div style={{ marginTop: '40px' }}>
          <h2>Classic Dashboard</h2>
          <React.Suspense fallback={<div>Loading...</div>}>
            <OriginalDashboard currentUser={currentUser} token={token} />
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}
