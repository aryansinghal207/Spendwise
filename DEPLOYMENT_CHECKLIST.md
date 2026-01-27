# SpendWise Deployment Checklist

## 📋 Pre-Deployment Steps

### 1. GitHub Setup
- [ ] Create a GitHub account (if you don't have one)
- [ ] Create a new repository: `spendwise`
- [ ] Push your code to GitHub:
  ```bash
  cd c:\Users\apurv\OneDrive\Desktop\SpendWise
  git init
  git add .
  git commit -m "Initial commit - Ready for deployment"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
  git push -u origin main
  ```

### 2. Environment Variables Check
- [ ] Verify `.gitignore` includes `.env` files
- [ ] Update `frontend/.env.production` with your backend URL (after backend deployment)
- [ ] Keep your Gemini API key secure

### 3. Code Verification
- [ ] CORS configuration added: `src/main/java/com/spendwise/SpendWise/config/CorsConfig.java`
- [ ] Vite config updated for environment variables
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend builds successfully: `./mvnw clean package -DskipTests`

---

## 🚀 Deployment Steps (Recommended: Vercel + Render)

### Phase 1: Backend & Database on Render (~10 mins)

#### Step 1: Create Render Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Verify your email

#### Step 2: Deploy PostgreSQL Database
- [ ] Click "New +" → "PostgreSQL"
- [ ] Settings:
  - Name: `spendwise-db`
  - Database: `spendwise_db`
  - User: `spendwise_user`
  - Region: Select closest
  - Plan: **Free**
- [ ] Click "Create Database"
- [ ] **IMPORTANT**: Copy the Internal Database URL:
  ```
  Format: postgres://user:password@hostname/database
  Example: postgres://spendwise_user:abc123@dpg-xyz.oregon-postgres.render.com/spendwise_db
  ```
- [ ] Save credentials in a safe place

#### Step 3: Deploy Spring Boot Backend
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select the `spendwise` repository
- [ ] Settings:
  - Name: `spendwise-backend`
  - Environment: **Docker** or **Java**
  - Branch: `main`
  - Build Command: `./mvnw clean package -DskipTests`
  - Start Command: `java -jar target/SpendWise-0.0.1-SNAPSHOT.jar`
  - Plan: **Free**
- [ ] Advanced Settings → Add Environment Variables:
  ```
  DB_URL = <Your Render PostgreSQL Internal Database URL from Step 2>
  DB_USER = spendwise_user
  DB_PASSWORD = <Your DB password from Step 2>
  GEMINI_API_KEY = REMOVED_API_KEY
  ```
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] Verify deployment: Check "Logs" tab for "Started SpendWiseApplication"
- [ ] **Copy Backend URL**: Example: `https://spendwise-backend.onrender.com`
- [ ] Test backend: Visit `https://your-backend-url.onrender.com/api/users`

### Phase 2: Frontend on Vercel (~5 mins)

#### Step 4: Update Frontend Environment Variable
- [ ] Open `frontend/.env.production`
- [ ] Update with your actual backend URL:
  ```
  VITE_API_URL=https://spendwise-backend.onrender.com
  ```
- [ ] Commit and push changes:
  ```bash
  git add frontend/.env.production
  git commit -m "Update production API URL"
  git push
  ```

#### Step 5: Create Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Click "Add New..." → "Project"

#### Step 6: Deploy Frontend
- [ ] Select your `spendwise` repository
- [ ] Settings:
  - Framework Preset: **Vite**
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Environment Variables:
  ```
  VITE_API_URL = https://spendwise-backend.onrender.com
  ```
  (Use your actual backend URL from Step 3)
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Get your live URL: `https://spendwise-abc123.vercel.app`

---

## ✅ Post-Deployment Verification

### Test Your Live Application
- [ ] Visit your Vercel frontend URL
- [ ] Sign Up with a new account
- [ ] Add a transaction
- [ ] Check dashboard displays correctly
- [ ] Test Astra AI chatbot
- [ ] Verify all charts and visualizations load
- [ ] Test receipt scanner
- [ ] Export a report

### Update CORS if Needed
If you get CORS errors:
- [ ] Update `CorsConfig.java` with your exact Vercel domain
- [ ] Commit and push changes
- [ ] Wait for Render to auto-deploy (or manually redeploy)

---

## 🔧 Alternative: Railway (All-in-One)

If you prefer a single platform:

### Railway Deployment
- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign up with GitHub
- [ ] Click "New Project"
- [ ] Add PostgreSQL database
- [ ] Deploy backend from GitHub repo
- [ ] Configure environment variables:
  ```
  DB_URL = ${{Postgres.DATABASE_URL}}
  GEMINI_API_KEY = REMOVED_API_KEY
  ```
- [ ] Generate domain for backend
- [ ] Deploy frontend (separate service)
- [ ] Configure frontend env: `VITE_API_URL=<backend-url>`
- [ ] Generate domain for frontend

---

## 📝 Important Notes

### Render Free Tier Limitations
- ⚠️ **Service sleeps after 15 min inactivity** (30-60 sec cold start)
- ⚠️ **PostgreSQL free database expires after 90 days**
- ⚠️ **750 hours/month** runtime limit
- ✅ **Automatic SSL/HTTPS**

### Keep Your App Alive (Optional)
To prevent sleep, use a service like:
- [UptimeRobot](https://uptimerobot.com) - Free pinging every 5 minutes
- [Cron-job.org](https://cron-job.org) - Scheduled requests

### Database Backup (Important!)
- [ ] Set up weekly backups of your database
- [ ] Before 90 days, migrate to a new free database or paid plan

---

## 🆘 Troubleshooting

### Backend Won't Start on Render
**Check:**
- [ ] Build logs for errors
- [ ] Environment variables are correct
- [ ] Database URL format is correct
- [ ] Java version matches (Java 21+)

**Fix:**
- Check Render logs tab
- Verify `DB_URL` format: `postgres://user:pass@host/db` (NOT `jdbc:postgresql://...`)
- Update `application.properties` to handle both formats if needed

### Frontend Can't Connect to Backend
**Check:**
- [ ] VITE_API_URL is correct in Vercel
- [ ] Backend is running (not sleeping)
- [ ] CORS configuration includes your Vercel domain
- [ ] Network tab in browser DevTools for errors

**Fix:**
- Wake up backend by visiting backend URL
- Check browser console for errors
- Verify CORS allows your frontend domain

### CORS Error
**Fix:**
- Update `CorsConfig.java`:
  ```java
  .allowedOrigins("https://your-actual-frontend.vercel.app")
  ```
- Commit and push
- Wait for auto-deploy

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads at your Vercel URL
- ✅ You can sign up/sign in
- ✅ Dashboard displays data
- ✅ Transactions can be added
- ✅ Astra AI chatbot responds
- ✅ Charts and visualizations work
- ✅ No console errors

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Spring Boot CORS**: https://spring.io/guides/gs/rest-service-cors/

---

**Ready to deploy?** Start with Phase 1, Step 1! 🚀
