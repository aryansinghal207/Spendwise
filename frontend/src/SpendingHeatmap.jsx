import React, { useEffect, useState } from 'react'

export default function SpendingHeatmap({ token }) {
  const [dailyData, setDailyData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch('/api/finance/daily-spending', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => {
        setDailyData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="heatmap-card">Loading heatmap...</div>

  // Get last 6 months of dates
  const today = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(today.getMonth() - 6)

  const dates = []
  for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d))
  }

  const maxAmount = Math.max(...Object.values(dailyData), 1)
  
  const getColor = (amount) => {
    if (amount === 0) return '#f3f4f6'
    const intensity = Math.min(amount / maxAmount, 1)
    if (intensity > 0.75) return '#dc2626'
    if (intensity > 0.5) return '#f97316'
    if (intensity > 0.25) return '#fbbf24'
    return '#86efac'
  }

  // Group by weeks
  const weeks = []
  let currentWeek = []
  dates.forEach((date, i) => {
    currentWeek.push(date)
    if (date.getDay() === 6 || i === dates.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <div className="heatmap-card">
      <h3>Spending Heatmap (Last 6 Months)</h3>
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="heatmap-week">
              {week.map(date => {
                const dateKey = date.toISOString().split('T')[0]
                const amount = dailyData[dateKey] || 0
                return (
                  <div 
                    key={dateKey}
                    className="heatmap-day"
                    style={{ backgroundColor: getColor(amount) }}
                    title={`${dateKey}: $${amount.toFixed(2)}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-box" style={{backgroundColor: '#f3f4f6'}} />
          <div className="legend-box" style={{backgroundColor: '#86efac'}} />
          <div className="legend-box" style={{backgroundColor: '#fbbf24'}} />
          <div className="legend-box" style={{backgroundColor: '#f97316'}} />
          <div className="legend-box" style={{backgroundColor: '#dc2626'}} />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
