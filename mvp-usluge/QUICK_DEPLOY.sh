#!/bin/bash

# ============================================
# 🚀 QUICK DEPLOY SCRIPT - MVP Usluge
# ============================================
# Korišćenje:
# 1. Postavi sve varijable ispod (database URL, secrets)
# 2. Pokreni: bash QUICK_DEPLOY.sh
# 3. Prati output

echo "🚀 Starting MVP Usluge Production Deployment..."
echo ""

# ============================================
# 🔴 POSTAVI OVE VARIJABLE PRE POKRETANJA
# ============================================

# Production Database URL (iz Neon/Supabase/AWS)
PROD_DATABASE_URL="postgresql://user:password@host.neon.tech:5432/database?schema=public"

# NextAuth Secret (generiši sa: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEXTAUTH_SECRET="tvoj-novo-generiš-secret-ovde-32-karaktera"

# Production domen
NEXTAUTH_URL="https://tvoj-domen.com"

# Resend API Key (ili zadrži test key ako nemaš production)
RESEND_API_KEY="re_production_key_ili_test"

# Cron Secret (može biti ista kao lokalno)
CRON_SECRET="dev-cron-secret-12345"

# ============================================
# FAZA 1: VALIDACIJA
# ============================================

echo "📋 Fase 1: Validacija..."
echo ""

if [ -z "$PROD_DATABASE_URL" ]; then
    echo "❌ GREŠKA: PROD_DATABASE_URL nije postavljen"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ GREŠKA: NEXTAUTH_SECRET nije postavljen"
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo "❌ GREŠKA: NEXTAUTH_URL nije postavljen"
    exit 1
fi

echo "✅ Sve varijable su postavljene"
echo ""

# ============================================
# FAZA 2: MIGRACIJE
# ============================================

echo "📦 Faza 2: Primena migracija na production bazu..."
echo ""

export DATABASE_URL="$PROD_DATABASE_URL"

npx prisma migrate deploy --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ GREŠKA: Migracije nisu uspele"
    exit 1
fi

echo "✅ Migracije primenjene"
echo ""

# ============================================
# FAZA 3: SEED (OPCIONALNO)
# ============================================

read -p "Želiš li da popuniš bazu sa test podacima (seed)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Faza 3: Pokretanje seed-a..."
    echo ""
    npm run db:seed

    if [ $? -ne 0 ]; then
        echo "❌ GREŠKA: Seed nije uspe"
        exit 1
    fi

    echo "✅ Seed završen"
    echo ""
else
    echo "⏭️  Seed preskočen"
    echo ""
fi

# ============================================
# FAZA 4: GIT COMMIT
# ============================================

echo "📝 Faza 4: Git commit..."
echo ""

git add vercel.json \
         VERCEL_SETUP.md \
         DEPLOYMENT_CHECKLIST.md \
         QUICK_DEPLOY.sh \
         .env.production.example \
         app/api/cron/run-migrations/route.ts

git commit -m "Configure Vercel production deployment with migrations cron job"

if [ $? -ne 0 ]; then
    echo "⚠️  Nema novih fajlova za commit (već su commitovani ili nema promena)"
fi

echo ""

# ============================================
# FAZA 5: PUSH & DEPLOY
# ============================================

echo "🚀 Faza 5: Push na Vercel..."
echo ""

read -p "Pokreni git push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push

    if [ $? -ne 0 ]; then
        echo "❌ GREŠKA: Git push nije uspe"
        exit 1
    fi

    echo "✅ Git push završen"
    echo ""
    echo "💡 Vercel će automatski startovati build..."
    echo ""
fi

# ============================================
# FAZA 6: INFORMACIJE ZA VERCEL UI
# ============================================

echo "📊 PREOSTAJE: Postavi environment varijable u Vercel UI"
echo ""
echo "1. Idi na https://vercel.com/dashboard"
echo "2. Klikni na projekt"
echo "3. Settings → Environment Variables"
echo "4. Dodaj sledeće:"
echo ""
echo "DATABASE_URL = $PROD_DATABASE_URL"
echo "NEXTAUTH_SECRET = $NEXTAUTH_SECRET"
echo "NEXTAUTH_URL = $NEXTAUTH_URL"
echo "RESEND_API_KEY = $RESEND_API_KEY"
echo "CRON_SECRET = $CRON_SECRET"
echo ""
echo "✅ Svi koraci su završeni!"
echo ""
echo "🎉 Aplikacija će biti live u roku od par minuta"
echo ""
