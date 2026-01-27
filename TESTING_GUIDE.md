# Quick Start Guide - Testing New Features

## Prerequisites
1. PostgreSQL running on port 8000 (or update in application.properties)
2. Database `spendwise_db` created
3. Java 21 installed
4. Node.js 18+ installed

## Setup Steps

### 1. Start Backend
```powershell
# Set environment variables
$env:DB_URL='jdbc:postgresql://localhost:8000/spendwise_db'
$env:DB_USER='spendwise_user'
$env:DB_PASSWORD='your-password'
$env:GEMINI_API_KEY='your-api-key-here'

# Run backend
./mvnw.cmd spring-boot:run
```

### 2. Build Frontend (if not already done)
```powershell
cd frontend
npm install
npm run build
cd ..
```

### 3. Access Application
Open browser: http://localhost:8080

## Testing Guide

### Feature 1: Financial Health Score
1. Sign up or sign in
2. Look for the Health Score card at the top
3. Add some income and expenses
4. Watch the score update
5. Score changes color based on value:
   - Green (80-100): Excellent
   - Yellow (60-79): Good
   - Orange (40-59): Fair
   - Red (0-39): Needs Improvement

### Feature 2: Spending Heatmap
1. Add expenses with different dates
2. Scroll down to "Spending Heatmap (Last 6 Months)"
3. Hover over squares to see daily amounts
4. Colors range from light gray (no spending) to red (high spending)

### Feature 3: Category Charts
1. Add expenses with different categories
2. View the "Spending by Category" donut chart
3. Hover over segments to see percentages
4. Categories: Food, Transport, Entertainment, Bills, Shopping, Healthcare, Other

### Feature 4: Milestones & Achievements
1. Find "Goals & Achievements" section
2. Click "+ Add Goal"
3. Fill in: Goal name, target amount, current amount, date, type
4. Update progress by typing amount and pressing Enter
5. Watch confetti animation when goal reaches 100%!

### Feature 5: Receipt Scanner (OCR)
1. Find "📷 Receipt Scanner" section
2. Click "Upload Receipt Image"
3. Select a receipt photo (clear text works best)
4. Wait for OCR processing (shows progress %)
5. Review extracted data
6. Edit if needed
7. Click "Save Expense"

### Feature 6: Budget Alerts
1. Find "Budget Tracker" section
2. Click "+ Add Budget"
3. Select category and set monthly limit
4. Add expenses in that category
5. Watch progress bar fill up
6. Get yellow warning at 80%
7. Get red alert when over budget

### Feature 7: Enhanced Split Bills
Note: This requires group account type
1. Navigate to debts section (will add to UI later)
2. Or use API directly:
   - POST /api/debts to create debt
   - GET /api/debts/summary to see who owes whom
   - PUT /api/debts/{id}/settle to mark as paid

### Feature 8: Theme Customizer
1. Look for 🎨 button (top right corner)
2. Click to open theme picker
3. Choose from 6 themes:
   - Light (default)
   - Dark
   - Ocean (blue)
   - Forest (green)
   - Sunset (orange)
   - Minimal (gray)
4. Theme saves automatically

### Feature 9: Enhanced Charts
1. Add incomes and expenses over several months
2. View the bar chart showing last 6 months
3. Green bars = Income
4. Red bars = Expenses
5. Hover for exact amounts

### Feature 10: Export & Reports
1. Find "📊 Export & Reports" section
2. Two options:
   - **Export CSV**: Downloads CSV file with all transactions
   - **Generate Report**: Opens printable HTML report
3. Use CSV for Excel/Google Sheets
4. Use Report for printing or saving as PDF (Ctrl+P)

## Testing API Endpoints Directly

### Health Score
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/finance/health-score
```

### Category Breakdown
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/finance/category-breakdown
```

### Daily Spending
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/finance/daily-spending
```

### Create Budget
```bash
curl -X POST http://localhost:8080/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"Food","limitAmount":500,"period":"monthly","month":12,"year":2025}'
```

### Create Goal
```bash
curl -X POST http://localhost:8080/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Save for vacation","targetAmount":5000,"currentAmount":0,"targetDate":"2026-06-01","type":"savings"}'
```

## Switching Between Views

### Enhanced Dashboard (default)
- Loaded automatically after sign-in
- Shows all new features
- Includes original dashboard at the bottom

### Classic Dashboard
- Click "📊 Classic View" button
- Shows original dashboard only
- Click "✨ Show Enhanced Features" to return

## Troubleshooting

### Frontend doesn't load
```powershell
cd frontend
npm run build
cd ..
# Restart backend
```

### Database errors
- Check PostgreSQL is running
- Verify port 8000 in application.properties
- Check database exists: `psql -U spendwise_user -d spendwise_db`

### Health Score shows 0
- Add at least one income or expense
- Refresh the page
- Check browser console for errors

### Receipt Scanner not working
- Use clear, well-lit photos
- Text should be readable
- Supported formats: JPG, PNG
- File size < 5MB recommended

### Charts not showing
- Add transactions with dates
- Wait for data to load
- Check browser console for errors
- Try refreshing the page

### Theme not saving
- Check browser allows localStorage
- Try another browser
- Clear cache and try again

## Sample Test Data

### Quick Setup Script
```javascript
// Run in browser console after logging in
const token = localStorage.getItem('token');

// Add incomes
await fetch('/api/finance/incomes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    description: 'Salary',
    date: '2025-12-01'
  })
});

// Add expenses
const categories = ['Food', 'Transport', 'Entertainment', 'Bills'];
for (let cat of categories) {
  await fetch('/api/finance/expenses', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.floor(Math.random() * 500) + 100,
      description: cat + ' expense',
      date: '2025-12-15',
      category: cat
    })
  });
}

console.log('Test data added! Refresh the page.');
```

## Performance Tips

1. **For testing OCR:** Use high-resolution images with clear text
2. **For heatmap:** Add expenses spread over multiple months
3. **For charts:** Add at least 5-10 transactions
4. **For budgets:** Set realistic limits based on expenses
5. **For goals:** Start with small targets for quick testing

## Success Criteria

✅ Health Score shows calculated value
✅ Heatmap displays colored squares
✅ Category chart shows pie/donut
✅ Goals can be created and updated
✅ Receipt scanner extracts text
✅ Budget alerts show warnings
✅ Themes switch instantly
✅ Charts display with animations
✅ Export downloads CSV file
✅ Report opens in new window

## Demo Account (Optional)

If you want to create a demo with pre-populated data:

1. Sign up with email: demo@spendwise.com
2. Use the sample script above
3. Add multiple months of data
4. Create budgets for each category
5. Set 2-3 goals
6. Try receipt scanner with a sample receipt

## Video Walkthrough (Suggested)

1. Sign in
2. Show health score
3. Add expense with category
4. Watch category chart update
5. Create a budget
6. Add expense to trigger alert
7. Create a goal
8. Update goal to 100% (see confetti!)
9. Switch themes
10. Export CSV
11. Generate report

## Need Help?

- Check FEATURES_IMPLEMENTATION_SUMMARY.md for detailed docs
- Review browser console for errors
- Check terminal for backend logs
- Verify all dependencies installed: `npm list`

---

**Enjoy your enhanced SpendWise experience! 🚀**
