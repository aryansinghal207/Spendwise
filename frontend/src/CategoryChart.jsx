import React, { useEffect, useState } from 'react'
import apiUrl from './api'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function CategoryChart({ token }) {
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch(apiUrl('/api/finance/category-breakdown'), {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => {
        setCategories(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="category-chart-card">Loading...</div>
  if (Object.keys(categories).length === 0) return <div className="category-chart-card">No expense data available</div>

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(categories),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // blue
          'rgba(236, 72, 153, 0.8)',  // pink
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(251, 146, 60, 0.8)',  // orange
          'rgba(168, 85, 247, 0.8)',  // purple
          'rgba(234, 179, 8, 0.8)',   // yellow
          'rgba(239, 68, 68, 0.8)',   // red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: $${value.toFixed(2)} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div className="category-chart-card">
      <h3>Spending by Category</h3>
      <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}
