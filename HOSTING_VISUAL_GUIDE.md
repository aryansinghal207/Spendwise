# 🌟 SpendWise - Free Hosting Guide (Visual)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐        HTTPS         ┌──────────────┐
│              │ ◄─────────────────── │              │
│   Browser    │                      │   Vercel     │
│   (User)     │                      │  (Frontend)  │
│              │ ───────────────────► │              │
└──────────────┘                      └──────┬───────┘
                                             │
                                             │ API Calls
                                             │ /api/*
                                             ▼
                                      ┌──────────────┐
                                      │    Render    │
                                      │   (Backend)  │
                                      │ Spring Boot  │
                                      └──────┬───────┘
                                             │
                                             │ SQL
                                             ▼
                                      ┌──────────────┐
                                      │    Render    │
                                      │ (PostgreSQL) │
                                      │   Database   │
                                      └──────────────┘
```

---

## 📊 Platform Comparison

| Feature | Vercel + Render | Railway | Render Only |
|---------|----------------|---------|-------------|
| **Setup Difficulty** | Medium | Easy | Easy |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Free Tier** | Best | Good | Good |
| **Cold Starts** | None (Frontend) | Faster | 30-60s |
| **Recommended For** | Production | Small projects | Prototypes |

---

## 🎯 Step-by-Step Visual Guide

### 🔷 Phase 1: Push to GitHub (5 min)

```bash
# In your SpendWise folder
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
git push -u origin main
```

**Result:** ✅ Code available on GitHub

---

### 🔷 Phase 2: Render Database (5 min)

**Navigate:** render.com → New + → PostgreSQL

```
┌────────────────────────────────┐
│    Render PostgreSQL Setup     │
├────────────────────────────────┤
│ Name:     spendwise-db         │
│ Database: spendwise_db         │
│ User:     spendwise_user       │
│ Region:   [Select closest]     │
│ Plan:     FREE ✓               │
└────────────────────────────────┘
```

**Copy this URL:**
```
postgres://spendwise_user:abc123xyz@dpg-xxxxx.oregon-postgres.render.com/spendwise_db
```

**Result:** ✅ Database created

---

### 🔷 Phase 3: Render Backend (10 min)

**Navigate:** render.com → New + → Web Service

```
┌────────────────────────────────────────┐
│      Render Web Service Setup          │
├────────────────────────────────────────┤
│ Repository:  spendwise                 │
│ Name:        spendwise-backend         │
│ Environment: Docker / Java             │
│ Branch:      main                      │
│ Plan:        FREE ✓                    │
├────────────────────────────────────────┤
│ Build Command:                         │
│   ./mvnw clean package -DskipTests     │
│                                        │
│ Start Command:                         │
│   java -jar target/                    │
│   SpendWise-0.0.1-SNAPSHOT.jar         │
└────────────────────────────────────────┘

Environment Variables:
┌──────────────┬─────────────────────────┐
│ Key          │ Value                   │
├──────────────┼─────────────────────────┤
│ DB_URL       │ postgres://user:pass@.. │
│ DB_USER      │ spendwise_user          │
│ DB_PASSWORD  │ [from database]         │
│ GEMINI_...   │ AIzaSyBHG1A9VD0...      │
└──────────────┴─────────────────────────┘
```

**Wait for:** "Build successful" → "Live" status

**Copy Backend URL:**
```
https://spendwise-backend.onrender.com
```

**Result:** ✅ Backend deployed

---

### 🔷 Phase 4: Update Frontend Config (2 min)

**Edit:** `frontend/.env.production`

```env
VITE_API_URL=https://spendwise-backend.onrender.com
```

**Commit:**
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

**Result:** ✅ Frontend configured

---

### 🔷 Phase 5: Vercel Frontend (5 min)

**Navigate:** vercel.com → Add New → Project

```
┌────────────────────────────────────────┐
│       Vercel Project Setup             │
├────────────────────────────────────────┤
│ Repository:    spendwise               │
│ Framework:     Vite                    │
│ Root Dir:      frontend                │
│ Build Cmd:     npm run build           │
│ Output Dir:    dist                    │
└────────────────────────────────────────┘

Environment Variables:
┌──────────────┬─────────────────────────┐
│ Key          │ Value                   │
├──────────────┼─────────────────────────┤
│ VITE_API_URL │ https://spendwise-      │
│              │ backend.onrender.com    │
└──────────────┴─────────────────────────┘
```

**Click:** Deploy

**Get Your URL:**
```
https://spendwise-xyz123.vercel.app
```

**Result:** ✅ Frontend live!

---

## 🎉 Success! Your App is Live

```
┌─────────────────────────────────────────┐
│   🌐 Your Live URLs                     │
├─────────────────────────────────────────┤
│ Frontend: vercel.app/your-app           │
│ Backend:  onrender.com/your-backend     │
│ Database: Render PostgreSQL (internal)  │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Your Deployment

### ✅ Checklist

1. **Visit Frontend URL**
   - [ ] Page loads without errors
   - [ ] Sign Up works
   - [ ] Sign In works

2. **Test Features**
   - [ ] Dashboard displays
   - [ ] Add transaction
   - [ ] Charts render
   - [ ] Astra AI chatbot responds
   - [ ] Receipt scanner works

3. **Check Console**
   - [ ] No red errors in browser console
   - [ ] API calls succeed (Network tab)
   - [ ] No CORS errors

---

## ⚠️ Important Notes

### Render Free Tier
```
⏰ Sleeps after 15 min → 30-60s wake up
💾 Database expires in 90 days
⏱️ 750 hours/month limit
```

### Keep Backend Awake (Optional)
Use [UptimeRobot](https://uptimerobot.com):
- Free account
- Add HTTP monitor
- URL: `https://your-backend.onrender.com/api/users`
- Interval: 5 minutes

---

## 🆘 Troubleshooting Guide

### Problem: Backend Build Failed
```
❌ Error in Render logs

Solutions:
1. Check Java version (need 21+)
2. Verify mvnw has execute permissions
3. Check pom.xml for errors
4. View full build logs in Render
```

### Problem: Frontend Can't Connect
```
❌ Network error / CORS error

Solutions:
1. Verify VITE_API_URL in Vercel
2. Check backend is running (not sleeping)
3. Wake backend by visiting its URL
4. Check CORS config includes Vercel domain
```

### Problem: Database Connection Failed
```
❌ Connection refused / Authentication failed

Solutions:
1. Verify DB_URL format (postgres://...)
2. Check username/password correct
3. Ensure database is running in Render
4. Check internal URL (not external)
```

---

## 📈 Monitoring Your App

### Render Dashboard
- View logs: Real-time application logs
- Metrics: CPU, Memory usage
- Events: Deployments, restarts

### Vercel Dashboard
- Analytics: Page views, performance
- Deployments: History, rollback
- Logs: Build and function logs

---

## 🎓 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Vercel: Add custom domain (free SSL)
   - Update CORS in backend

2. **Monitoring**
   - Set up UptimeRot to prevent sleep
   - Enable email alerts

3. **Backup Database**
   - Export data regularly (Render DB expires in 90 days)
   - Consider upgrading to paid tier if needed

4. **Performance**
   - Monitor Vercel Analytics
   - Optimize images and assets
   - Use CDN for static files

---

## 📚 Resources

- 📖 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed instructions
- ✅ [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- 🚀 [DEPLOY_NOW.md](DEPLOY_NOW.md) - Quick summary
- 🧪 Run `test-build.ps1` - Verify builds before deploying

---

**Ready to deploy? Follow the phases above! 🚀**

Need help? Check the detailed [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
