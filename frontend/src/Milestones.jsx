import React, { useEffect, useState } from 'react'
import apiUrl from './api'
import confetti from 'canvas-confetti'

export default function Milestones({ token }) {
  const [goals, setGoals] = useState([])
  const [achievements, setAchievements] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [token])

  const loadData = () => {
    if (!token) return
    Promise.all([
      fetch(apiUrl('/api/goals'), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()),
      fetch(apiUrl('/api/goals/achievements'), { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json())
    ])
      .then(([goalsData, achievementsData]) => {
        setGoals(goalsData)
        setAchievements(achievementsData)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const celebrateGoal = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const body = {
      name: formData.get('name'),
      targetAmount: parseFloat(formData.get('targetAmount')),
      currentAmount: parseFloat(formData.get('currentAmount') || 0),
      targetDate: formData.get('targetDate'),
      type: formData.get('type')
    }

    const resp = await fetch('/api/goals', {
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

  const handleUpdateProgress = async (goalId, newAmount) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    await fetch(`/api/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentAmount: newAmount })
    })

    // Check if goal completed
    if (newAmount >= goal.targetAmount && goal.status !== 'completed') {
      await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      })
      celebrateGoal()
    }

    loadData()
  }

  if (loading) return <div className="milestones-card">Loading...</div>

  return (
    <div className="milestones-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3>Goals & Achievements</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {achievements && (
        <div className="achievements-summary">
          <div className="achievement-badge">
            <div className="badge-icon">🎯</div>
            <div className="badge-content">
              <div className="badge-number">{achievements.completedGoals}</div>
              <div className="badge-label">Completed</div>
            </div>
          </div>
          <div className="achievement-badge">
            <div className="badge-icon">🔥</div>
            <div className="badge-content">
              <div className="badge-number">{achievements.activeGoals}</div>
              <div className="badge-label">Active</div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="add-goal-form">
          <input type="text" name="name" placeholder="Goal name" required />
          <input type="number" name="targetAmount" placeholder="Target amount" step="0.01" required />
          <input type="number" name="currentAmount" placeholder="Current amount" step="0.01" defaultValue="0" />
          <input type="date" name="targetDate" required />
          <select name="type" required>
            <option value="savings">Savings</option>
            <option value="expense_reduction">Expense Reduction</option>
            <option value="investment">Investment</option>
          </select>
          <button type="submit">Add Goal</button>
        </form>
      )}

      <div className="goals-list">
        {goals.filter(g => g.status === 'active').map(goal => {
          const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          return (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <h4>{goal.name}</h4>
                <span className="goal-type">{goal.type}</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="progress-text">
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ({progress.toFixed(0)}%)
                </div>
              </div>
              <div className="goal-actions">
                <input 
                  type="number" 
                  placeholder="Update amount" 
                  step="0.01"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateProgress(goal.id, parseFloat(e.target.value))
                      e.target.value = ''
                    }
                  }}
                />
                <span className="goal-date">Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
