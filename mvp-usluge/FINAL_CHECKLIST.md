# ✅ FINAL DEPLOYMENT CHECKLIST - Sve što trebaš

## 🎯 TLI; DR (Kratka verzija)

```bash
# 1. Postavi production bazu (Neon/Supabase)
# 2. Generiši NEXTAUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Pokreni migracije sa lokala:
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. (OPCIONALNO) Pokreni seed:
npm run db:seed

# 5. Potvrdi sve fajlove su modifikovani:
git status

# 6. Pushuj:
git push

# 7. Postavi env varijable u Vercel UI (Settings → Environment Variables)

# 8. Deploy:
vercel --prod

# 9. Čekaj migracije na Vercel (svakog dana 04:00 UTC)
```

---

## ✅ CHECKLIST - Po Prioritetu

### 🔴 OBAVEZNO PRVO (bez ova dva koraka nema deploymenta):

- [ ] **KREIRAJ production PostgreSQL bazu**
  ```
  Gde: https://neon.tech (najjednostavnije)
  ili: https://supabase.com
  ili: AWS RDS, Google Cloud, itd.

  Kopiraj connection string (trebalo će ti za sve komande)
  ```

- [ ] **Generiši NEXTAUTH_SECRET** (OBAVEZNO NOV!)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  # Kopiraj rezultat
  ```

---

### 🟡 FAZA 1: Pripremi sve Varijable (Local Setup)

Iz direktorijuma `mvp-usluge`:

#### Kreiraj privremeni `.env.production` (SAMO ZA ЛОКАЛНО - ne pushuj!)
```bash
# Kopiraj sadržaj iz .env i zameni vrednosti:

# 🔴 OBAVEZNO PROMENITI:
DATABASE_URL="postgresql://...production baza..."
NEXTAUTH_SECRET="tvoj-novo-generiš-secret"
NEXTAUTH_URL="https://tvoj-domen.com"

# 🟡 OPCIONO - ako imaš production verzije:
RESEND_API_KEY="re_production_ili_test"
RESEND_FROM_EMAIL="noreply@tvoj-domen.com"

# ⚪ MOGU BITI ISTE:
CRON_SECRET="dev-cron-secret-12345"
UPSTASH_REDIS_REST_URL="https://decent-pangolin-30420.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXbUAAIncDIxM2NmMWNlZmFlNWM0NGEwOTYzNDU3OWU0NTkzMGI5OHAyMzA0MjA"
```

✅ **Sačuva fajl (PRIVREMENO)** - NIKADA ga ne pushuj u git!

---

### 🟢 FAZA 2: Pokreni Migracije sa Lokala

```bash
# Zameni sa tvojim production connection string:
DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db?schema=public" \
npx prisma migrate deploy

# Očekivani output:
# ✅ 1 migration applied
# ✅ 2 migrations applied
# ... (5 ukupno)
```

**Ako greška:**
- ❌ "Can't reach database" → Proverim connection string ili firewall
- ❌ "Authentication failed" → Proverim user/password

---

### 🟢 FAZA 3: (OPCIONO) Pokreni Seed

Ako želiš test podatke (7 korisnika, 6 usluga, 30+ rezv, ocene):

```bash
DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db?schema=public" \
npm run db:seed

# Očekivani output:
# 👤 Creating users...
# ✅ Created 7 users
# ...
# 🎉 Seed completed successfully!

# Test kredencijali:
# - admin@mvp.com / admin123
# - marko@gmail.com / marko123
# - petar@frizer.com / petar123
```

---

### 🟠 FAZA 4: Git Commit i Push

```bash
# Proverim šta je novo
git status

# Trebalo bi da vidim:
# - vercel.json (PROMENJEN)
# - app/api/cron/run-migrations/route.ts (NOVI)
# - VERCEL_SETUP.md (NOVI)
# - DEPLOYMENT_CHECKLIST.md (NOVI)
# - .env.production.example (NOVI)
# - QUICK_DEPLOY.sh (NOVI)
# - FINAL_CHECKLIST.md (NOVI)

# Dodaj sve
git add .

# Commit
git commit -m "Configure Vercel production deployment with migration cron"

# Push
git push
```

---

### 🔵 FAZA 5: Vercel Environment Variables

**KLJUČNI KORAK - SVE IDE OVDE, NE U GIT!**

1. Idi na https://vercel.com/dashboard
2. Klikni na **mvp-usluge** projekat
3. **Settings → Environment Variables**
4. Za svaku varijablu klikni **Add**

**Dodaj:**

| Key | Value | Source |
|-----|-------|--------|
| `DATABASE_URL` | `postgresql://...production baza...` | Neon/Supabase |
| `NEXTAUTH_SECRET` | (rezultat iz node komande) | Generiš |
| `NEXTAUTH_URL` | `https://tvoj-domen.com` | Tvoj domen |
| `RESEND_API_KEY` | `re_...` | Resend (ili test) |
| `RESEND_FROM_EMAIL` | `noreply@tvoj-domen.com` | E-mail |
| `CRON_SECRET` | `dev-cron-secret-12345` | Može biti ista |
| `UPSTASH_REDIS_REST_URL` | (ako koristiš) | Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | (ako koristiš) | Upstash |
| `NODE_ENV` | `production` | Standard |

✅ Trebalo bi da budu `[protected]` (ikonice zaključanih)

---

### 🟣 FAZA 6: Deploy

```bash
# Iz direktorijuma mvp-usluge:
vercel --prod

# Ili automatski nakon git push-a (ako je Vercel linkovan)
```

**Čekaj:**
- 🔨 Build proces (2-5 min)
- 🚀 Deployment (instant)
- ✅ Preview live na https://projekat.vercel.app

---

### 🎯 FAZA 7: Verifikacija

#### Test web aplikacije:
- [ ] Idi na https://tvoj-domen.com
- [ ] Login sa test kredencijalima (ako si radio seed)
- [ ] Kreiraj novu rezervaciju
- [ ] Proverim da se sve učitava

#### Proverim Vercel logs:
```
https://vercel.com/dashboard → mvp-usluge → Deployments
```
Trebalo bi da vidiš:
- ✅ Build succeeded
- ✅ Deployment successful

#### Test cron job (OPCIONALNO):
```bash
# Pokreni migracije sada (ne čekaj 04:00):
curl -X POST "https://tvoj-domen.com/api/cron/run-migrations" \
  -H "Authorization: Bearer dev-cron-secret-12345"

# Trebalo bi: HTTP 200 OK
```

---

## 🚨 SVE ŠEME DEŠAVA SAM (AUTOMATSKI)

| Šta | Gde | Kada |
|-----|-----|------|
| **Build** | Vercel CI/CD | Na svaki `git push` |
| **Migracije** | `/api/cron/run-migrations` | Svaki dan 04:00 UTC |
| **Email slanje** | Resend API | Na svaki booking |
| **Cache** | Upstash Redis | Real-time |

---

## ⚠️ VAŽNE NAPOMENE

### Nikada ne radi OVO:

❌ Ne commituj `.env` fajl
❌ Ne commituj API ključeve
❌ Ne koristiš localhost bazu u production
❌ Ne koristiš test NEXTAUTH_SECRET

### Uvek radi OVO:

✅ Postavi sve sekrete u Vercel UI
✅ Generiši nov NEXTAUTH_SECRET
✅ Koristi production bazu
✅ Backup baza pre prvog deploymenta
✅ Test login pre nego što ju otkrijete javno

---

## 🆘 Ako Nešto Pođe Po Zlu

### "Can't reach database"
```bash
# Proverim connection string
DATABASE_URL="postgresql://..." npx prisma db execute --stdin
# Trebalo bi: interactive stdin / stdout
```

### "NEXTAUTH_SECRET is not set"
- Proverim da je u Vercel UI
- Proverim da nema razmaka na početku/kraju

### "Migrations not applied"
- Čekam do 04:00 UTC (cron pokrenuo se)
- Ili ručno pokrenem curl komandu gore

### "Build fails"
- Proverim Vercel logs
- Proverim da su sve varijable postavljene
- Testiram lokalno: `npm run build`

---

## 📚 Fajlovi koji su kreirani

| Fajl | Svrha |
|------|-------|
| `VERCEL_SETUP.md` | Detaljno uputstvo |
| `DEPLOYMENT_CHECKLIST.md` | Kompletna lista koraka |
| `FINAL_CHECKLIST.md` | Ova datoteka (brz pregled) |
| `QUICK_DEPLOY.sh` | Bash script za deployment |
| `.env.production.example` | Template varijabli |
| `app/api/cron/run-migrations/route.ts` | Serverless funkcija za migracije |
| `vercel.json` | Vercel konfiguracija (PROMENJENA) |

---

## ✅ Gotovo!

Kada prođeš sve korake i sve je zeleno:

🎉 **Aplikacija je live u produkciji sa:**
- ✅ Production PostgreSQL
- ✅ Automatske migracije
- ✅ Sigurnosne tajne (u Vercel UI)
- ✅ Email slanje
- ✅ Redis cache
- ✅ Cron jobovi

**Sretno na produkciji!** 🚀
