# SpendWise Quick Start Guide

## Starting the Application

### Method 1: Using the Startup Script (Recommended)

**Backend:**
```powershell
.\START_BACKEND.ps1
```
Keep this terminal window open!

**Frontend:**
```powershell
cd frontend
npm run dev
```

### Method 2: Manual Commands

**Backend (in one terminal):**
```powershell
$env:DB_URL='jdbc:postgresql://localhost:8000/spendwise_db'
$env:DB_USER='spendwise_user'
$env:DB_PASSWORD='your-password'
$env:GEMINI_API_KEY='your-gemini-api-key'
.\mvnw.cmd spring-boot:run
```

**Frontend (in another terminal):**
```powershell
cd frontend
npm run dev
```

---

## Access the Application

- **Frontend:** http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API:** http://localhost:8080
- **Database:** PostgreSQL on localhost:8000

---

## Important Notes

1. **PostgreSQL must be running first** on port 8000
2. **Keep both terminals open** - don't press Ctrl+C
3. **Backend takes ~10 seconds** to fully start
4. **Astra AI Chatbot** uses Google Gemini (FREE, 1,500 requests/day)

---

## Testing Astra Chatbot

1. Sign in to SpendWise
2. Click the Astra chatbot icon (bottom right)
3. Try a non-FAQ question like:
   - "What is recursion?"
   - "Explain compound interest"
   - "Best budgeting strategies?"
4. Look for the 🤖 badge on AI-powered responses

---

## Troubleshooting

**Backend won't start:**
- Check if PostgreSQL is running on port 8000
- Verify database credentials: spendwise_user / your-password
- Check if port 8080 is already in use

**Chatbot not working:**
- Ensure backend is fully started (look for "Started SpendWiseApplication")
- Check backend logs for errors
- Verify frontend is on http://localhost:5173

**"Connection refused" errors:**
- Backend might not be running - restart it
- Check firewall settings

---

## Stopping the Application

1. Press **Ctrl+C** in each terminal
2. Wait for graceful shutdown
3. PostgreSQL can keep running
