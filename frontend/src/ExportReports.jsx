import React, { useState } from 'react'
import apiUrl from './api'

export default function ExportReports({ token }) {
  const [exporting, setExporting] = useState(false)

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const resp = await fetch(apiUrl('/api/finance/export/csv'), {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (resp.ok) {
        const csv = await resp.text()
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `spendwise_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
    setExporting(false)
  }

  const handleGenerateReport = async () => {
    setExporting(true)
    try {
      const resp = await fetch(apiUrl('/api/finance/summary'), {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      
      if (resp.ok) {
        const data = await resp.json()
        
        // Generate HTML report
        const reportHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>SpendWise Financial Report</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
              h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
              .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
              .summary-card { background: #f3f4f6; padding: 20px; border-radius: 8px; }
              .summary-card h3 { margin: 0 0 10px 0; color: #4b5563; }
              .summary-card .amount { font-size: 24px; font-weight: bold; }
              .positive { color: #10b981; }
              .negative { color: #ef4444; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #2563eb; color: white; padding: 12px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
              tr:hover { background: #f9fafb; }
              .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>SpendWise Financial Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            
            <div class="summary">
              <div class="summary-card">
                <h3>Total Income</h3>
                <div class="amount positive">$${data.totalIncome.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="amount negative">$${data.totalExpense.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <h3>Total Investments</h3>
                <div class="amount">$${data.totalInvestment.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <h3>Net Balance</h3>
                <div class="amount ${data.net >= 0 ? 'positive' : 'negative'}">$${data.net.toFixed(2)}</div>
              </div>
            </div>

            <h2>Recent Expenses</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.expenses.slice(0, 20).map(e => `
                  <tr>
                    <td>${e.date || ''}</td>
                    <td>${e.description || ''}</td>
                    <td>${e.category || 'Other'}</td>
                    <td>$${e.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Recent Incomes</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.incomes.slice(0, 20).map(i => `
                  <tr>
                    <td>${i.date || ''}</td>
                    <td>${i.description || ''}</td>
                    <td>$${i.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>SpendWise - Personal Finance Management</p>
            </div>
          </body>
          </html>
        `
        
        // Open in new window for printing
        const printWindow = window.open('', '_blank')
        printWindow.document.write(reportHTML)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Report generation failed. Please try again.')
    }
    setExporting(false)
  }

  return (
    <div className="export-reports-card">
      <h3>📊 Export & Reports</h3>
      <div className="export-options">
        <button 
          onClick={handleExportCSV} 
          disabled={exporting}
          className="export-btn"
        >
          {exporting ? 'Exporting...' : '📥 Export CSV'}
        </button>
        <button 
          onClick={handleGenerateReport} 
          disabled={exporting}
          className="export-btn"
        >
          {exporting ? 'Generating...' : '📄 Generate Report'}
        </button>
      </div>
      <p className="export-note">
        Export your financial data for tax filing or generate a detailed PDF-ready report
      </p>
    </div>
  )
}
