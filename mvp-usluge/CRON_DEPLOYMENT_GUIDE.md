# 🚀 CRON JOBS DEPLOYMENT GUIDE

## 📋 Overview

Your application has **2 cron jobs**:
1. **Send Reminders** - Sends booking reminders to clients 24h before appointment
2. **Verify Companies** - Checks and updates company verification status

Both jobs are already implemented and configured for Vercel.

---

## 🔧 DEPLOYMENT OPTIONS

### **OPTION 1: VERCEL (Recommended) ⭐**

Vercel is included with Next.js and is the **easiest option**.

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub/GitLab/Bitbucket
3. Import your project repository

#### Step 2: Set Environment Variables
In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   ```
   CRON_SECRET = [Generate a random secret, e.g., use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   DATABASE_URL = [Your production database URL]
   NEXTAUTH_SECRET = [Your NextAuth secret]
   NEXTAUTH_URL = [Your production URL, e.g., https://myapp.vercel.app]
   EMAIL_* = [Your email service credentials]
   ```

#### Step 3: Deploy
```bash
# Push to GitHub - Vercel auto-deploys
git push origin main
```

#### Step 4: Verify Cron Jobs
Vercel Dashboard → **Crons** tab will show:
- ✅ Send Reminders - 8:00 AM daily (UTC)
- ✅ Verify Companies - 3:00 AM daily (UTC)

## 🧪 TESTING BEFORE DEPLOYMENT

### Test Cron Jobs Locally
```bash
# Start your dev server
npm run dev

# In another terminal, test send-reminders
curl -X POST http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test verify-companies
curl -X GET http://localhost:3000/api/cron/verify-companies \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Expected Responses

**Send Reminders Success:**
```json
{
  "success": true,
  "message": "Sent 5 reminders successfully",
  "data": {
    "total": 5,
    "successful": 5,
    "failed": 0
  }
}
```

**Verify Companies Success:**
```json
{
  "success": true,
  "message": "Verifikacija preduzeća uspešno proverena",
  "data": { ... }
}
```

---

## 📊 MONITORING & LOGS

### Vercel
1. Dashboard → **Functions** tab → see execution logs
2. **Crons** tab → see next scheduled runs
3. Email alerts for failures (optional)