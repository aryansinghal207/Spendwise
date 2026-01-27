import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function EnhancedFinanceChart({ summary }) {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (!summary || !summary.incomes || !summary.expenses) return

    const last6Months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push(d.toISOString().slice(0, 7))
    }

    const incomeByMonth = {}
    const expenseByMonth = {}
    
    last6Months.forEach(m => {
      incomeByMonth[m] = 0
      expenseByMonth[m] = 0
    })

    summary.incomes.forEach(inc => {
      if (inc.date) {
        const month = inc.date.slice(0, 7)
        if (incomeByMonth.hasOwnProperty(month)) {
          incomeByMonth[month] += inc.amount || 0
        }
      }
    })

    summary.expenses.forEach(exp => {
      if (exp.date) {
        const month = exp.date.slice(0, 7)
        if (expenseByMonth.hasOwnProperty(month)) {
          expenseByMonth[month] += exp.amount || 0
        }
      }
    })

    const data = {
      labels: last6Months.map(m => {
        const [year, month] = m.split('-')
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }),
      datasets: [
        {
          label: 'Income',
          data: last6Months.map(m => incomeByMonth[m]),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
        },
        {
          label: 'Expenses',
          data: last6Months.map(m => expenseByMonth[m]),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        },
      ],
    }

    setChartData(data)
  }, [summary])

  if (!chartData) return <div>Loading chart...</div>

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income vs Expenses (Last 6 Months)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0)
          }
        }
      }
    }
  }

  return (
    <div className="enhanced-chart-card">
      <div style={{ height: '350px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
