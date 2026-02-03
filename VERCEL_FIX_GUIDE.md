# 🔧 VERCEL DEPLOYMENT FIX - Sign In/Sign Up Errors

## The Problem

Your frontend on Vercel (`spendwise-bay.vercel.app`) is showing **"NOT_FOUND"** errors because it's trying to call API endpoints that don't exist on the Vercel domain. The frontend and backend need to be hosted separately.

**Error Message:**
```
Error: The page could not be found
NOT_FOUND bom1::4mshm-1769610869305-c73b6238b138
```

## Root Cause

The `VITE_API_URL` environment variable is **not set in Vercel**, so the frontend tries to fetch from:
- `https://spendwise-bay.vercel.app/api/auth/signin` ❌
- `https://spendwise-bay.vercel.app/api/auth/signup` ❌

But your backend is actually hosted at:
- `https://spendwise-backend.onrender.com` (or similar)

## ✅ SOLUTION - 3 Steps

### Step 1: Confirm Your Backend URL

First, check if your backend is running:

1. **Find your backend URL** (one of these):
   - Render: `https://spendwise-backend.onrender.com`
   - Railway: `https://your-app.railway.app`
   - Other PaaS platform

2. **Test the backend** - Open in browser:
   ```
   https://your-backend-url.onrender.com/api/auth/me
   ```
   
   Expected response:
   - Status 401 with "Missing token" = ✅ Backend is working
   - Connection timeout/error = ❌ Backend is not running

3. **If backend is not running**, you need to deploy it first:
   ```powershell
   # Build the Spring Boot app
   ./mvnw clean package -DskipTests
   ```
   Then deploy to Render/Railway/your chosen platform.

---

### Step 2: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `SpendWise` or similar
3. **Go to Settings** → **Environment Variables**
4. **Add new variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (YOUR actual backend URL)
   - **Environments**: Check all boxes (Production, Preview, Development)

5. **Save** the variable

---

### Step 3: Redeploy Frontend

After adding the environment variable, you MUST redeploy:

**Option A: Trigger from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Confirm the redeploy

**Option B: Push a new commit**
```powershell
# Make any small change
cd frontend
git add .
git commit -m "Fix: Configure VITE_API_URL for Vercel"
git push origin main
```

---

## 🧪 Verify the Fix

1. **Wait for deployment** to complete (~2 minutes)
2. **Clear browser cache** (Ctrl+Shift+Delete) or use incognito
3. **Visit**: https://spendwise-bay.vercel.app
4. **Try Sign Up** with test data:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Monthly Income: 50000
   - Account Type: Individual

5. **Check for errors**:
   - ✅ Should redirect to dashboard or show success
   - ❌ If still shows NOT_FOUND, check Step 1 again

---

## 🔍 Common Issues

### Issue 1: Backend URL is Wrong
**Symptom**: CORS error or connection refused

**Fix**: 
- Double-check the backend URL in Vercel environment variables
- Make sure it includes `https://` and has NO trailing slash
- Example: `https://spendwise-backend.onrender.com` ✅
- Not: `https://spendwise-backend.onrender.com/` ❌

### Issue 2: Backend is Asleep (Free Tier)
**Symptom**: First request takes 30+ seconds or times out

**Fix**: 
- Render/Railway free tiers sleep after inactivity
- Visit backend URL directly to wake it up
- Wait 30-60 seconds for it to start
- Then try sign in/up again

### Issue 3: Environment Variable Not Applied
**Symptom**: Still getting NOT_FOUND after redeployOK, let me continue with the fix:

**Fix**: 
- Verify the variable is set: Vercel Dashboard → Settings → Environment Variables
- Make sure you redeployed AFTER adding the variable
- Try a "Clean" redeploy: Settings → General → Delete Project Cache, then redeploy

### Issue 4: Database Not Connected
**Symptom**: Backend responds but sign up fails with 500 error

**Fix**: 
- Check backend logs on Render/Railway
- Verify `DB_URL`, `DB_USER`, `DB_PASSWORD` environment variables are set
- Make sure database is running and accessible

---

## 📝 Quick Reference

### What Each Environment Variable Does

| Variable | Where | Purpose | Example |
|----------|-------|---------|---------|
| `VITE_API_URL` | Vercel (Frontend) | Points frontend to backend | `https://spendwise-backend.onrender.com` |
| `DB_URL` | Render/Railway (Backend) | Database connection string | `postgresql://user:pass@host/db` |
| `DB_USER` | Render/Railway (Backend) | Database username | `postgres` |
| `DB_PASSWORD` | Render/Railway (Backend) | Database password | `yourpassword` |
| `GEMINI_API_KEY` | Render/Railway (Backend) | Google Gemini API key | `AIzaSy...` |

---

## 🎯 Expected Behavior After Fix

### Sign Up Flow:
1. User fills form → Click "SIGN UP"
2. Frontend calls: `https://your-backend.onrender.com/api/auth/signup`
3. Backend creates user in database
4. Backend returns: `{ token: "...", user: {...} }`
5. Frontend stores token in localStorage
6. Frontend redirects to Dashboard

### Sign In Flow:
1. User enters email/password → Click "LOGIN"
2. Frontend calls: `https://your-backend.onrender.com/api/auth/signin`
3. Backend verifies credentials
4. Backend returns: `{ token: "...", user: {...} }`
5. Frontend stores token
6. Frontend redirects to Dashboard

---

## 🆘 Still Not Working?

If you've followed all steps and still see errors:

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Try to sign in**
4. **Look for the request to `/api/auth/signin`**
5. **Check**:
   - Request URL: Should start with your backend URL
   - Status Code: What error code?
   - Response: What's the error message?

**Share this information** for further debugging:
- Request URL
- Status code
- Response body
- Any console errors (Console tab)

---

## ✅ Checklist

Before asking for help, make sure you've done ALL of these:

- [ ] Backend is deployed and accessible (test the URL in browser)
- [ ] `VITE_API_URL` is set in Vercel environment variables
- [ ] `VITE_API_URL` value includes `https://` and NO trailing slash
- [ ] Redeployed frontend AFTER adding environment variable
- [ ] Cleared browser cache or used incognito mode
- [ ] Database is connected (check backend logs)
- [ ] Waited 60 seconds for backend to wake up (if free tier)
- [ ] Checked browser DevTools → Network tab for actual error

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Sign up creates a new user (check database)
- ✅ Sign in redirects to dashboard
- ✅ No "NOT_FOUND" errors
- ✅ Network tab shows requests going to your backend URL
- ✅ Status codes are 200 (success) or 401 (unauthorized but backend is working)

---

**Need more help?** Check the [main deployment guide](./START_HERE_DEPLOYMENT.md) or backend logs for specific error messages.
