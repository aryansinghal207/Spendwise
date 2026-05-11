import React, { useState } from 'react'
import HealthScore from './HealthScore'
import CategoryChart from './CategoryChart'
import Milestones from './Milestones'
import ReceiptScanner from './ReceiptScanner'
import BudgetAlerts from './BudgetAlerts'
import ThemeCustomizer from './ThemeCustomizer'
import TrendingStocks from './TrendingStocks'

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
          <HealthScore key={`health_${refreshKey}`} token={token} />
          <TrendingStocks />
        </div>

        {/* Main Content - two equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
            <CategoryChart key={`cat_${refreshKey}`} token={token} />
            <Milestones key={`milestones_${refreshKey}`} token={token} />
          </div>
          <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
            <BudgetAlerts key={`budget_${refreshKey}`} token={token} />
            <ReceiptScanner key={`scanner_${refreshKey}`} token={token} onExpenseCreated={handleRefresh} />
          </div>
        </div>

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
