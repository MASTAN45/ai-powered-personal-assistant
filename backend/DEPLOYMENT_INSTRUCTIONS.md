# Vercel Deployment Instructions - AI Personal Assistant Backend

## ✅ CODE-SIDE CONFIGURATION COMPLETE

All source code, build configuration, and serverless entry points are correctly configured and tested.

---

## 🚀 VERCEL PROJECT SETTINGS (CRITICAL)

You MUST configure these settings in your Vercel Project Dashboard:

### 1. Go to Project Settings
- Navigate to: https://vercel.com/dashboard
- Select project: `ai-personal-assistant-api` (or your backend project name)
- Click: **Settings** tab

### 2. General Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Root Directory** | `backend` | ⚠️ CRITICAL: Tells Vercel to build from backend/ subdirectory |
| **Framework Preset** | Other | No framework detection needed |

**How to set Root Directory:**
1. In General section, find "Root Directory"
2. Click **Edit**
3. Enter: `backend`
4. Click **Save**

### 3. Build & Development Settings

| Setting | Value | Override? |
|---------|-------|-----------|
| **Build Command** | `npm run build` | No (use default) |
| **Output Directory** | *(leave empty)* | No |
| **Install Command** | `npm install` | No (use default) |

⚠️ **IMPORTANT:** Do NOT override Output Directory. This is a serverless Functions project, not a static site.

### 4. Environment Variables

Click **Environment Variables** and add these:

#### Required (Production, Preview, Development)

```bash
# Database
MONGODB_URI=mongodb+srv://your-atlas-uri

# Authentication  
JWT_SECRET=generate-32-char-secret-see-below

# CORS
FRONTEND_URL=https://your-frontend-url.vercel.app

# Environment
NODE_ENV=production
```

#### Optional

```bash
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-key-optional
GEMINI_MODEL=gemini-pro
AI_MODE=demo
```

**Generate JWT_SECRET:**
```bash
# Run this in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Notes:**
- ⚠️ JWT_SECRET must be at least 32 characters
- ⚠️ Use production MongoDB Atlas URI (not localhost)
- ⚠️ FRONTEND_URL will be updated after frontend deployment
- ⚠️ Never commit secrets to Git

---

## 📁 PROJECT STRUCTURE (Verified)

```
backend/
├── api/
│   └── serverless.js          ← Vercel entry point
├── src/
│   ├── app.ts                 ← Express application (no app.listen)
│   ├── server.ts              ← Local dev server (with app.listen)
│   ├── vercel-serverless.ts   ← Serverless handler with initialization
│   ├── config/
│   │   ├── database.ts        ← MongoDB connection with caching
│   │   ├── env.ts             ← Environment validation
│   │   └── logger.ts
│   ├── routes/                ← All API routes
│   └── ...
├── dist/                      ← Compiled JavaScript (auto-generated)
│   └── vercel-serverless.js   ← Loaded by api/serverless.js
├── package.json
├── tsconfig.json
└── vercel.json                ← Vercel Functions configuration
```

---

## 🔄 DEPLOYMENT FLOW

### Automatic (GitHub Push)
1. Push to `main` branch
2. Vercel detects push via webhook
3. Clones repository
4. Changes to `backend/` directory (Root Directory setting)
5. Runs `npm install`
6. Runs `npm run build` (compiles TypeScript)
7. Detects `api/serverless.js` as Functions entry point
8. Deploys serverless function
9. ✅ Success!

### Manual (Vercel CLI)
```bash
# From project root:
cd backend
vercel --prod

# Follow prompts to link to existing project
```

---

## 🧪 VERIFICATION AFTER DEPLOYMENT

### 1. Check Build Logs
- Go to Vercel Dashboard → Deployments
- Click on latest deployment
- Check build logs for:
  - ✅ `npm install` succeeds
  - ✅ `> backend@1.0.0 build` 
  - ✅ `> tsc` (no errors)
  - ✅ Deployment successful

### 2. Test Endpoints

```bash
# Replace with your actual deployment URL
BACKEND_URL=https://your-backend.vercel.app

# Health check
curl $BACKEND_URL/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-30T...",
  "services": {
    "database": "connected",
    "uptime": 123
  }
}

# Readiness check
curl $BACKEND_URL/api/ready

# Expected response:
{
  "ready": true,
  "timestamp": "2025-01-30T...",
  "checks": {
    "envVarsSet": true,
    "dbConnected": true,
    "jwtSecretValid": true,
    "corsConfigured": true
  }
}
```

### 3. Test Authentication

```bash
# Register test user
curl -X POST $BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "fullName": "Test User"
  }'

# Login
curl -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Should receive JWT token in response
```

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "No Output Directory named 'public' found"

**Cause:** Root Directory not set to `backend` in Project Settings

**Solution:**
1. Go to Project Settings → General
2. Set Root Directory to `backend`
3. Click Save
4. Redeploy

### ❌ Error: "Cannot find module '../dist/vercel-serverless'"

**Cause:** TypeScript didn't compile or build failed

**Solution:**
1. Check build logs for TypeScript errors
2. Verify `npm run build` succeeds locally
3. Ensure all dependencies are in `dependencies` (not `devDependencies`)

### ❌ Error: "MONGODB_URI not defined"

**Cause:** Environment variables not configured

**Solution:**
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Redeploy (env vars only apply to new deployments)

### ❌ Error: "JWT_SECRET must be at least 32 characters"

**Cause:** JWT_SECRET too short or not set

**Solution:**
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update JWT_SECRET in Environment Variables
3. Redeploy

### ⚠️ Warning: "mongodb-memory-server install scripts"

**Status:** Harmless warning, does not cause deployment failure

**Details:** mongodb-memory-server is used for local development only. In production, it's never initialized.

---

## 🎯 SUCCESS CRITERIA

✅ Deployment status: Success (green checkmark)  
✅ `/api/health` returns 200 with `"database": "connected"`  
✅ `/api/ready` returns 200 with `"ready": true`  
✅ `/api/auth/register` accepts new users  
✅ `/api/auth/login` returns JWT tokens  
✅ No CORS errors when accessed from frontend  

---

## 📞 NEXT STEPS AFTER BACKEND DEPLOYMENT

1. Note your backend URL (e.g., `https://ai-personal-assistant-api.vercel.app`)
2. Deploy frontend as separate Vercel project
3. Configure frontend `VITE_API_URL` to point to backend URL
4. Update backend `FRONTEND_URL` environment variable to frontend URL
5. Redeploy backend to apply CORS changes
6. Test end-to-end authentication flow

---

## 📋 SUMMARY: WHAT WAS FIXED

### Problems Identified
1. ❌ Root vercel.json with malformed JSON (PowerShell escape codes)
2. ❌ Vercel building from root directory instead of backend/
3. ❌ Vercel detecting monorepo as static site
4. ❌ Multiple conflicting vercel.json files
5. ❌ UTF-8 BOM issues in JSON files

### Solutions Implemented
1. ✅ Removed root vercel.json (not needed)
2. ✅ Created correct backend/vercel.json with Functions configuration
3. ✅ Verified Express serverless handler exports correctly
4. ✅ MongoDB connection caching for warm starts
5. ✅ Separate local dev (server.ts) and serverless (vercel-serverless.ts) entry points
6. ✅ All JSON files use UTF-8 without BOM
7. ✅ TypeScript compilation tested and working
8. ✅ Environment variable validation implemented

### Architecture
- **Entry Point:** `backend/api/serverless.js`
- **Handler:** `backend/dist/vercel-serverless.js` (compiled from src/vercel-serverless.ts)
- **Express App:** `backend/dist/app.js` (no app.listen, exported for serverless)
- **Local Dev:** `backend/src/server.ts` (with app.listen for development)
- **Database:** MongoDB Atlas with connection pooling and caching
- **Warm Starts:** Connection reused across invocations

---

**Last Updated:** 2025-01-30  
**Version:** 1.0.0  
**Status:** Ready for Deployment