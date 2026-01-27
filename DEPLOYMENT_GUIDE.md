# 🚀 SpendWise Deployment Guide - Free Hosting

This guide will help you deploy SpendWise to free hosting platforms.

## 📋 Deployment Strategy

**Recommended Free Stack:**
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render.com (Spring Boot)
- **Database**: Render PostgreSQL (Free tier)

### Alternative Options:
1. **Railway.app** - All-in-one (Backend + Database + Frontend)
2. **Fly.io** - Good for Spring Boot apps
3. **Netlify** (Frontend) + Render (Backend + DB)

---

## 🎯 Option 1: Vercel + Render (Recommended)

### Part A: Deploy Backend & Database on Render

#### Step 1: Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub/Google
3. Connect your GitHub repository (push SpendWise to GitHub first)

#### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `spendwise-db`
   - **Database**: `spendwise_db`
   - **User**: `spendwise_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
3. Click **"Create Database"**
4. **Save these credentials** (Internal Database URL):
   ```
   postgres://spendwise_user:password@hostname/spendwise_db
   ```

#### Step 3: Deploy Spring Boot Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `spendwise-backend`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/SpendWise-0.0.1-SNAPSHOT.jar`
   - **Plan**: Free
4. Add **Environment Variables**:
   ```
   DB_URL=<Your Render PostgreSQL Internal URL>
   DB_USER=spendwise_user
   DB_PASSWORD=<Your DB Password>
   GEMINI_API_KEY=REMOVED_API_KEY
   ```
5. Click **"Create Web Service"**
6. Wait for deployment (~5-10 minutes)
7. **Copy your backend URL**: `https://spendwise-backend.onrender.com`

#### Step 4: Update Frontend API URL
Before deploying frontend, update the API endpoint:

1. Create `frontend/.env.production` (see file below)
2. Update `vite.config.js` to use the environment variable

### Part B: Deploy Frontend on Vercel

#### Step 1: Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..." → "Project"**

#### Step 2: Import Repository
1. Select your SpendWise repository
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 3: Environment Variables
Add this environment variable:
```
VITE_API_URL=https://spendwise-backend.onrender.com
```

#### Step 4: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Get your live URL: `https://spendwise-xyz.vercel.app`

---

## 🎯 Option 2: Railway (All-in-One)

### Step 1: Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**

### Step 2: Add PostgreSQL Database
1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-provisions the database
3. Note the connection string in Variables

### Step 3: Deploy Backend
1. Click **"+ New"** → **"GitHub Repo"**
2. Select SpendWise repository
3. Configure:
   - **Start Command**: `./mvnw spring-boot:run`
4. Add Environment Variables:
   ```
   DB_URL=${{Postgres.DATABASE_URL}}
   GEMINI_API_KEY=REMOVED_API_KEY
   ```
5. Generate Domain (Settings → Generate Domain)

### Step 4: Deploy Frontend
1. Click **"+ New"** → **"GitHub Repo"** (same repo)
2. Configure:
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
3. Add Environment Variable:
   ```
   VITE_API_URL=<Your Backend Railway URL>
   ```
4. Generate Domain

---

## 🎯 Option 3: Render Only (Simplest)

Deploy both frontend and backend on Render as static site + web service.

### Step 1: Database (Same as Option 1)
Create PostgreSQL database on Render.

### Step 2: Backend Web Service (Same as Option 1)
Deploy Spring Boot as web service.

### Step 3: Frontend as Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=<Your Backend Render URL>
   ```
5. Deploy

---

## 📝 Pre-Deployment Checklist

### 1. Push Code to GitHub
```bash
cd c:\Users\apurv\OneDrive\Desktop\SpendWise
git init
git add .
git commit -m "Initial commit - SpendWise"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
git push -u origin main
```

### 2. Create `.gitignore`
Ensure you have a proper `.gitignore` (file created separately).

### 3. Create Production Environment Files
- `frontend/.env.production`
- Update `vite.config.js` for production API URL

### 4. Update CORS Configuration
Add CORS configuration to Spring Boot (file created separately).

---

## 🔧 Post-Deployment Configuration

### Update Frontend API Calls
Your frontend needs to use the production backend URL. Update:
- `frontend/src/App.jsx` and other components
- Replace `http://localhost:8080` with environment variable

### Test Your Deployment
1. Visit your frontend URL
2. Sign up/Sign in
3. Test all features:
   - Dashboard
   - Transactions
   - Astra AI Chatbot
   - Reports

---

## 💰 Free Tier Limits

### Render.com
- ✅ 750 hours/month web service
- ✅ PostgreSQL: 90 days (then expires, backup required)
- ✅ Auto-sleep after 15 min inactivity
- ⚠️ Cold starts (~30 seconds)

### Vercel
- ✅ Unlimited personal projects
- ✅ 100 GB bandwidth/month
- ✅ Instant deployments
- ✅ Auto SSL

### Railway
- ✅ $5 credit/month (lasts 500 hours)
- ✅ No sleep mode
- ✅ Faster cold starts

---

## 🚨 Important Notes

1. **Render Free Tier**: Services sleep after 15 min inactivity (30s wake-up time)
2. **Environment Variables**: Never commit API keys to GitHub
3. **Database Backups**: Render free DB expires after 90 days - backup regularly
4. **CORS**: Must configure CORS for production domains
5. **Build Time**: First deployment takes 5-10 minutes

---

## 🆘 Troubleshooting

### Backend Not Starting
- Check logs in Render dashboard
- Verify environment variables
- Ensure database URL is correct

### Frontend Can't Connect to Backend
- Check CORS configuration
- Verify VITE_API_URL is correct
- Check Network tab in browser DevTools

### Database Connection Failed
- Verify DATABASE_URL format
- Check if database is running
- Ensure IP whitelist (if any)

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Spring Boot CORS](https://spring.io/guides/gs/rest-service-cors/)

---

**Next Steps**: Follow Option 1 (Vercel + Render) for the best free hosting experience!
