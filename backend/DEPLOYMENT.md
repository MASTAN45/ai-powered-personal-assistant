# Vercel Deployment Instructions

## CRITICAL: Vercel Project Settings Required

### 1. Set Root Directory to 'backend'
Go to Project Settings > General > Root Directory
Click Edit, enter: backend, click Save

### 2. Environment Variables (Production)
- MONGODB_URI=your-mongodb-atlas-uri
- JWT_SECRET=generate-32-char-secret
- FRONTEND_URL=your-frontend-url
- NODE_ENV=production

Generate JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
