# 🚀 Quick Deployment Summary

## Free Hosting Setup (30 minutes total)

### Option 1: Vercel + Render (Recommended) ⭐

**Best for**: Reliable, fast frontend with Spring Boot backend

1. **Push to GitHub** (5 min)
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/spendwise.git
   git push -u origin main
   ```

2. **Render.com - Database** (5 min)
   - Sign up at render.com with GitHub
   - New → PostgreSQL → Free tier
   - Copy the Internal Database URL

3. **Render.com - Backend** (10 min)
   - New → Web Service → Connect GitHub repo
   - Build: `./mvnw clean package -DskipTests`
   - Start: `java -jar target/SpendWise-0.0.1-SNAPSHOT.jar`
   - Add env vars: DB_URL, DB_USER, DB_PASSWORD, GEMINI_API_KEY
   - Deploy & copy backend URL

4. **Vercel - Frontend** (5 min)
   - Sign up at vercel.com with GitHub
   - Import repo → Root: `frontend`
   - Add env var: `VITE_API_URL=<your-backend-url>`
   - Deploy → Get your live URL

**Done!** Your app is live 🎉

---

### Option 2: Railway (All-in-One) 🚂

**Best for**: Simpler setup, single platform

1. **Push to GitHub** (same as above)

2. **Railway.app** (15 min)
   - Sign up at railway.app with GitHub
   - New Project → Add PostgreSQL
   - Deploy Backend: Connect repo
   - Add env: `DB_URL=${{Postgres.DATABASE_URL}}`
   - Deploy Frontend: Same repo, root: `/frontend`
   - Add env: `VITE_API_URL=<backend-url>`

**Done!** Both services running on Railway

---

### Option 3: Render Only (Static + API) 🎨

**Best for**: Minimal complexity

1. Push to GitHub (same as above)
2. Render: PostgreSQL database
3. Render: Backend web service
4. Render: Frontend static site (root: `frontend`)

---

## 📝 Required Environment Variables

### Backend (Render/Railway)
```
DB_URL=<your-postgresql-url>
DB_USER=spendwise_user
DB_PASSWORD=<your-db-password>
GEMINI_API_KEY=REMOVED_API_KEY
```

### Frontend (Vercel/Railway)
```
VITE_API_URL=<your-backend-url>
```

---

## ⚡ Free Tier Limits

| Platform | Limits | Notes |
|----------|--------|-------|
| **Render** | 750hrs/mo, 15min sleep | Best for backend |
| **Vercel** | Unlimited, 100GB BW | Best for frontend |
| **Railway** | $5 credit/mo (~500hrs) | Good all-in-one |

---

## 🔗 Useful Links

- **Full Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)

---

## 🆘 Common Issues

**Backend won't start?**
- Check database URL format in Render logs
- Verify env variables are set correctly

**CORS errors?**
- Backend `CorsConfig.java` already configured for Vercel/Netlify/Render domains
- Add your specific domain if needed

**Frontend can't connect?**
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend is awake (not sleeping)

---

## ✅ Test Your Deployment

1. Visit your frontend URL
2. Sign up / Sign in
3. Add a transaction
4. Test Astra AI chatbot
5. Check dashboard charts

---

**Need help?** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions!
