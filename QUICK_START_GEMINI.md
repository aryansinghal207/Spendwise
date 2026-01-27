# Quick Start - Google Gemini Integration (FREE!)

## Get Your FREE Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy it (starts with `AIza...`)

**NO CREDIT CARD REQUIRED!** Free tier: 1,500 requests/day

## Start the Application

**Terminal 1 - Backend:**
```powershell
cd C:\Users\apurv\OneDrive\Desktop\SpendWise
$env:DB_URL='jdbc:postgresql://localhost:8000/spendwise_db'
$env:DB_USER='spendwise_user'
$env:DB_PASSWORD='your-password'
$env:GEMINI_API_KEY='AIza-your-actual-api-key-here'
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\apurv\OneDrive\Desktop\SpendWise\frontend
npm run dev
```

## Access the App

Open browser: **http://localhost:5173**

## Test AI Integration

1. Click Astra chatbot (bottom-right)
2. Try FAQ: "How do I add an expense?" (instant answer)
3. Try AI: "What's the best budgeting strategy?" (Gemini answer - FREE! 🤖)

## Why Gemini?

- ✅ **FREE**: 1,500 requests/day (vs OpenAI charges per request)
- ✅ **No credit card required**
- ✅ **Same quality as ChatGPT**
- ✅ **Fast responses**

---

For full details, see [GEMINI_INTEGRATION.md](GEMINI_INTEGRATION.md)
