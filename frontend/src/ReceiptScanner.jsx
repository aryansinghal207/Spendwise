import React, { useState } from 'react'
import Tesseract from 'tesseract.js'

export default function ReceiptScanner({ token, onExpenseCreated }) {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setScanning(true)
    setProgress(0)

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          }
        }
      )

      const text = result.data.text
      
      // Extract amount (look for patterns like $XX.XX or XX.XX)
      const amountMatch = text.match(/\$?\s*(\d+\.\d{2})|(\d+,\d+\.\d{2})/g)
      let amount = 0
      if (amountMatch && amountMatch.length > 0) {
        const cleanAmount = amountMatch[amountMatch.length - 1].replace(/[$,\s]/g, '')
        amount = parseFloat(cleanAmount)
      }

      // Extract date
      const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/g)
      let date = new Date().toISOString().split('T')[0]
      if (dateMatch && dateMatch.length > 0) {
        try {
          const parsedDate = new Date(dateMatch[0])
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0]
          }
        } catch (e) {
          // use default date
        }
      }

      // Try to extract merchant name (usually first few lines)
      const lines = text.split('\n').filter(l => l.trim())
      const merchant = lines.length > 0 ? lines[0].substring(0, 50) : 'Receipt'

      setExtractedData({
        amount,
        description: merchant,
        date,
        category: 'Other'
      })
      setScanning(false)
    } catch (error) {
      console.error('OCR Error:', error)
      setScanning(false)
      alert('Failed to scan receipt. Please try another image.')
    }
  }

  const handleSaveExpense = async () => {
    if (!extractedData) return

    const resp = await fetch('/api/finance/expenses', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(extractedData)
    })

    if (resp.ok) {
      alert('Expense saved successfully!')
      setExtractedData(null)
      setPreview(null)
      if (onExpenseCreated) onExpenseCreated()
    }
  }

  const handleEditField = (field, value) => {
    setExtractedData({ ...extractedData, [field]: value })
  }

  return (
    <div className="receipt-scanner-card">
      <h3>📷 Receipt Scanner</h3>
      
      <div className="scanner-upload">
        <label htmlFor="receipt-upload" className="upload-label">
          {scanning ? `Scanning... ${progress}%` : 'Upload Receipt Image'}
        </label>
        <input 
          id="receipt-upload"
          type="file" 
          accept="image/*"
          onChange={handleImageUpload}
          disabled={scanning}
          style={{ display: 'none' }}
        />
      </div>

      {preview && (
        <div className="receipt-preview">
          <img src={preview} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
        </div>
      )}

      {scanning && (
        <div className="scanning-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {extractedData && (
        <div className="extracted-data">
          <h4>Review Extracted Data</h4>
          <div className="form-group">
            <label>Amount:</label>
            <input 
              type="number" 
              value={extractedData.amount} 
              onChange={(e) => handleEditField('amount', parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input 
              type="text" 
              value={extractedData.description} 
              onChange={(e) => handleEditField('description', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input 
              type="date" 
              value={extractedData.date} 
              onChange={(e) => handleEditField('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select 
              value={extractedData.category} 
              onChange={(e) => handleEditField('category', e.target.value)}
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Bills">Bills</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="scanner-actions">
            <button onClick={handleSaveExpense} className="btn-primary">Save Expense</button>
            <button onClick={() => { setExtractedData(null); setPreview(null) }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
