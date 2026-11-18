# DEPLOYMENT GUIDE - AI POWERED PERSONAL ASSISTANT

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] Backend builds successfully
- [x] Frontend builds successfully  
- [x] No secrets in code
- [x] .env.example created
- [x] .gitignore comprehensive
- [x] vercel.json files created
- [x] README.md prepared

## 🚀 STEP-BY-STEP DEPLOYMENT

### STEP 1: CREATE GITHUB REPOSITORY

1. Go to: https://github.com/new
2. Repository name: `ai-powered-personal-assistant`
3. Description: `AI-powered email management system with intelligent classification and automated workflows`
4. Visibility: **Public**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### STEP 2: PUSH CODE TO GITHUB

Open PowerShell in project directory and run:

```powershell
cd "C:\Users\Mastan Shaik\OneDrive\Desktop\Personal Assistant – AI-Powered Email Management Dashboard"

# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: AI-Powered Personal Assistant Email Management Dashboard"

# Rename branch to main
git branch -M main

# Add remote (REPLACE WITH YOUR REPO URL)
git remote add origin https://github.com/YOUR_USERNAME/ai-powered-personal-assistant.git

# Push to GitHub
git push -u origin main
```

### STEP 3: DEPLOY BACKEND TO VERCEL

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Navigate to backend
cd backend

# Ensure build works
npm run build

# Deploy to Vercel
vercel --prod
```

**Follow Vercel prompts:**
- Link to existing project? **No**
- Project name: `ai-assistant-backend`
- Directory: `./` (current)
- Override settings? **No**

**Add Environment Variables in Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select your backend project
3. Settings → Environment Variables
4. Add these variables:



5. Redeploy: `vercel --prod` again

### STEP 4: DEPLOY FRONTEND TO VERCEL

```powershell
# Navigate to frontend
cd ../frontend

# Deploy to Vercel
vercel --prod
```

**Follow Vercel prompts:**
- Link to existing project? **No**
- Project name: `ai-assistant-frontend`
- Directory: `./` (current)
- Override settings? **No**

**Add Environment Variables in Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Add:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

5. Redeploy: `vercel --prod` again

### STEP 5: UPDATE BACKEND CORS

1. Go to backend Vercel project settings
2. Update `FRONTEND_URL` environment variable with actual frontend URL
3. Redeploy backend

### STEP 6: TEST DEPLOYMENT

1. Visit your frontend URL
2. Try to login with demo account:
   - Email: `demo-assistant@example.com`
   - Password: `password123`
3. Test chatbot functionality
4. Verify dashboard loads
5. Check conversations page

### STEP 7: SEED PRODUCTION DATABASE (OPTIONAL)

If database is empty:

```powershell
# Update backend/.env with production MongoDB URI temporarily
cd backend
npm run seed
# This creates demo accounts and data
```

**OR** use MongoDB Atlas to import seed data manually.

## 🔧 TROUBLESHOOTING

### Backend 500 Error
- Check Vercel logs: `vercel logs`
- Verify MongoDB URI is correct
- Ensure JWT_SECRET is set
- Check CORS settings

### Frontend API Error
- Verify VITE_API_URL is set correctly
- Check CORS in backend
- Ensure backend is deployed and running

### Authentication Issues
- Verify JWT_SECRET matches between deployments
- Check cookie settings
- Ensure FRONTEND_URL in backend matches actual frontend

### Database Connection Error
- MongoDB Atlas: Whitelist Vercel IP (0.0.0.0/0 for testing)
- Verify MongoDB URI format
- Check database user permissions

## 📝 POST-DEPLOYMENT CHECKLIST

- [ ] Frontend loads successfully
- [ ] Backend API responds (check /api/health)
- [ ] Login works with demo account
- [ ] Dashboard displays correctly
- [ ] Chatbot responds to messages
- [ ] Conversations load
- [ ] Charts render properly
- [ ] Mobile responsive works
- [ ] No console errors

## 🎯 FINAL STEPS

1. Update README.md with live URLs
2. Add screenshots to GitHub
3. Share repository link
4. Test all features in production
5. Monitor Vercel logs for errors

## 📧 DEMO CREDENTIALS

**Assistant Account:**
- Email: demo-assistant@example.com
- Password: password123

**Client Account:**
- Email: demo-client@example.com
- Password: password123

---

**Your application is ready for deployment!**
