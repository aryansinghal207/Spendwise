import React, { useEffect, useState } from 'react'

export default function BudgetAlerts({ token }) {
  const [budgets, setBudgets] = useState([])
  const [budgetStatus, setBudgetStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [token])

  const loadData = () => {
    if (!token) return
    Promise.all([
      fetch('/api/budgets', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()),
      fetch('/api/budgets/status', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())
    ])
      .then(([budgetsData, statusData]) => {
        setBudgets(budgetsData)
        setBudgetStatus(statusData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleAddBudget = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const body = {
      category: formData.get('category'),
      limitAmount: parseFloat(formData.get('limitAmount')),
      period: 'monthly',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }

    const resp = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (resp.ok) {
      setShowAddForm(false)
      loadData()
      e.target.reset()
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!confirm('Delete this budget?')) return
    await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    loadData()
  }

  if (loading) return <div className="budget-alerts-card">Loading...</div>

  const activeAlerts = Object.values(budgetStatus).filter(s => s.isOverBudget || s.isNearLimit)

  return (
    <div className="budget-alerts-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3>Budget Tracker</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className="alerts-section">
          {activeAlerts.map(alert => (
            <div 
              key={alert.budgetId} 
              className={`budget-alert ${alert.isOverBudget ? 'alert-danger' : 'alert-warning'}`}
            >
              <span className="alert-icon">{alert.isOverBudget ? '🚨' : '⚠️'}</span>
              <div className="alert-content">
                <strong>{alert.category}</strong>
                <div>
                  {alert.isOverBudget 
                    ? `Over budget by $${Math.abs(alert.remaining).toFixed(2)}!` 
                    : `${alert.percentage.toFixed(0)}% of budget used`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddBudget} className="add-budget-form">
          <select name="category" required>
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" name="limitAmount" placeholder="Monthly limit" step="0.01" required />
          <button type="submit">Add Budget</button>
        </form>
      )}

      <div className="budgets-list">
        {Object.entries(budgetStatus).map(([category, status]) => {
          const percentage = status.percentage
          const isOver = status.isOverBudget
          
          return (
            <div key={category} className="budget-item">
              <div className="budget-header">
                <h4>{category}</h4>
                <button onClick={() => handleDeleteBudget(status.budgetId)} className="btn-delete">×</button>
              </div>
              <div className="budget-progress">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${isOver ? 'over-budget' : percentage >= 80 ? 'near-limit' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }} 
                  />
                </div>
              </div>
              <div className="budget-details">
                <span>${status.spent.toFixed(2)} / ${status.limit.toFixed(2)}</span>
                <span className={isOver ? 'text-danger' : percentage >= 80 ? 'text-warning' : ''}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
