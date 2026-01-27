import React, { useEffect, useState } from 'react'

export default function HealthScore({ token }) {
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/finance/health-score', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => {
        setScore(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="health-score-card">Loading...</div>
  if (!score) return <div className="health-score-card">Unable to load health score</div>

  const getColor = () => {
    if (score.score >= 80) return '#10b981' // green
    if (score.score >= 60) return '#f59e0b' // yellow
    if (score.score >= 40) return '#f97316' // orange
    return '#ef4444' // red
  }

  const percentage = (score.score / 100) * 360

  return (
    <div className="health-score-card">
      <h3>Financial Health Score</h3>
      <div className="health-gauge">
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle 
            cx="100" 
            cy="100" 
            r="80" 
            fill="none" 
            stroke={getColor()} 
            strokeWidth="20"
            strokeDasharray={`${percentage * 1.396} 502`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
          <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="700" fill={getColor()}>
            {score.score}
          </text>
          <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6b7280">
            {score.rating}
          </text>
        </svg>
      </div>
      <div className="health-details">
        <div className="health-stat">
          <span className="health-label">Savings Rate:</span>
          <span className="health-value">{score.savingsRate}%</span>
        </div>
        <div className="health-stat">
          <span className="health-label">Investment Rate:</span>
          <span className="health-value">{score.investmentRate}%</span>
        </div>
        <div className="health-stat">
          <span className="health-label">Expense Ratio:</span>
          <span className="health-value">{score.expenseRatio}%</span>
        </div>
      </div>
    </div>
  )
}
