# 🚀 Kompletan Checklist za Vercel Production Deployment

## 📋 Pre nego što počneš - Proverite sve što sledi

### ✅ FAZA 1: Priprema Production Baze (15 min)

- [ ] **Kreiraj production PostgreSQL bazu**
  - Opcija A: [Neon](https://neon.tech) (PREPORUČENO - besplatno, best za Vercel)
  - Opcija B: [Supabase](https://supabase.com)
  - Opcija C: AWS RDS / Google Cloud SQL
  - Opcija D: Tvoj vlastiti server

- [ ] **Kopiraj connection string**
  - Format: `postgresql://user:password@host:5432/database?schema=public`
  - Spremi ga privremeno (trebalo će ti za Vercel)

---

### ✅ FAZA 2: Pripremi Environment Varijable (20 min)

**Odavde uzmi vrednosti iz `.env` i `.env.local`:**

```bash
# Lokalno, vidljive varijable:
cat .env.local
cat .env
```

**Napravi listu **sa production vrednostima**:**

#### 🔴 OBAVEZNE varijable:

1. **DATABASE_URL** ← PROMENITI!
   ```
   Stara (lokalna): postgresql://postgres:postgres@localhost:5432/mvp_usluge?schema=public
   Nova (production): postgresql://...tvoja production baza...
   ```

2. **NEXTAUTH_SECRET** ← GENERIŠI NOVO!
   ```bash
   # Pokreni ovu komandu u terminalu:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Rezultat: (32 karaktera) - kopiraj ga
   ```

3. **NEXTAUTH_URL** ← PROMENITI!
   ```
   Stara (lokalna): http://localhost:3000
   Nova (production): https://tvoj-domen.com
   # (ili https://vercel-auto-domain.vercel.app ako nemaš custom domain)
   ```

#### 🟡 PREOSTALE varijable (proveriti):

| Varijabla | Gde se koristi | Trebalo je promeniti? |
|-----------|------|-----------|
| `RESEND_API_KEY` | Email slanje | ❓ Ako imaš production Resend API key |
| `RESEND_FROM_EMAIL` | Email slanje | ❓ Ako imaš production email |
| `CRON_SECRET` | Zaštita cron jobova | ❌ Može biti ista kao lokalno |
| `UPSTASH_REDIS_REST_URL` | Redis cache | ❓ Ako koristiš production Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth | ❓ Ako koristiš production Redis |

---

### ✅ FAZA 3: Postavi Environment Varijable u Vercel UI (25 min)

1. **Idi na Vercel Dashboard**
   - https://vercel.com/dashboard
   - Klikni na projekt **mvp-usluge**

2. **Settings → Environment Variables**

3. **Dodaj svaku varijablu pojedinačno**

**Primer:**
```
Key:   DATABASE_URL
Value: postgresql://user:pass@host.neon.tech:5432/db?schema=public
```

**Sve varijable:**
```
DATABASE_URL = [production postgresql connection string]
NEXTAUTH_SECRET = [novo generiš]
NEXTAUTH_URL = https://tvoj-domen.com
RESEND_API_KEY = [production ili test key]
RESEND_FROM_EMAIL = noreply@tvoj-domen.com (ili onboarding@resend.dev za test)
CRON_SECRET = dev-cron-secret-12345 (ili novi)
UPSTASH_REDIS_REST_URL = [ako koristiš]
UPSTASH_REDIS_REST_TOKEN = [ako koristiš]
NODE_ENV = production
```

✅ **Verifikuj** da su sve varijable vidljive kao `[protected]` u listi

---

### ✅ FAZA 4: Pripremi Migracije i Seed (10 min)

**Šta trebalo da se desi sa bazom:**

1. **Migracije** (primene šemu)
   - 5 pending migracija se trebale primeniti
   - Automatski kroz Vercel cron `/api/cron/run-migrations` u 04:00
   - **ALI** - ako želiš seed SAD (preporučeno), uradi ručno ispod

2. **Seed** (test podaci)
   - Kreira 7 test korisnika
   - Kreira 6 usluga
   - Kreira 30+ test rezervacija
   - Kreira test ocene

---

### ✅ FAZA 5: Pokreni Migracije i Seed sa LOKALA (15 min)

**VAŽNO:** Pre nego što pushneš na Vercel, pokreni sve na production bazi sa lokalne mašine:

#### Korak 1: Postavi production DATABASE_URL lokalno
```bash
# Privremeno zameni DATABASE_URL u .env.local ili kao env varijabla:
export DATABASE_URL="postgresql://...tvoja production baza..."

# Ili direktno u komandi (ne pushuj sa tim u git!):
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public" npx prisma migrate deploy
```

#### Korak 2: Primeni migracije
```bash
# Iz direktorijuma mvp-usluge:
DATABASE_URL="postgresql://...production..." npx prisma migrate deploy
```

**Očekivani output:**
```
✅ 1 migration applied
✅ 2 migrations applied
...
✅ 5 migrations applied successfully
```

❌ **GREŠKA:** Ako dobiješ grešku, proverim:
- Je li production baza dostupna?
- Je li connection string ispravan?
- Ima li firewall pristupa?

#### Korak 3: Pokreni seed (OPCIONALNO - samo ako želiš test podatke)
```bash
# Seed puni bazu sa test podacima (admin, klijenti, usluge, itd)
DATABASE_URL="postgresql://...production..." npm run db:seed
```

**Očekivani output:**
```
🌱 Starting database seed...
👤 Creating users...
✅ Created 7 users
📂 Creating categories...
✅ Created 5 categories
💼 Creating services...
✅ Created 6 services
⭐ Creating reviews...
✅ Created 9 reviews
🎉 Seed completed successfully!
```

**Test kredencijali nakon seed-a:**
- Admin: `admin@mvp.com` / `admin123`
- Klijent: `marko@gmail.com` / `marko123`
- Freelancer: `petar@frizer.com` / `petar123`
- Company: `info@beautysalon.com` / `beauty123`

---

### ✅ FAZA 6: Git i Push na Vercel (5 min)

```bash
# Iz direktorijuma mvp-usluge:

# 1. Proverite šta ste promenili
git status

# 2. Dodaj nove fajlove (vercel setup fajlove)
git add vercel.json \
         VERCEL_SETUP.md \
         DEPLOYMENT_CHECKLIST.md \
         .env.production.example \
         app/api/cron/run-migrations/route.ts

# 3. Kreiraj commit
git commit -m "Configure Vercel production deployment with migrations cron job"

# 4. Push (ovaj commit će trigger Vercel build automatski ako je linked)
git push

# 5. Ili direktno pusti na Vercel
vercel --prod
```

---

### ✅ FAZA 7: Verifikuj Production Deployment (10 min)

#### Web aplikacija je live:
- [ ] Otvori `https://tvoj-domen.com` ili `https://projekt.vercel.app`
- [ ] Testira login sa test kredencijalima
- [ ] Kreiraj novu rezervaciju
- [ ] Testiraj email slanje (ako je Resend konfigurisan)

#### Proverim Vercel logs:
1. Idi na https://vercel.com/dashboard → projekat → Logs
2. Trebalo bi da vidiš:
   - ✅ Build completed
   - ✅ Deployment successful
   - ✅ Function `/api/cron/run-migrations` invoked daily

#### Proverim cron izvršavanje (04:00 UTC):
```bash
# Ako trebaju migracije sada (ne čekaj 04:00):
curl -X POST "https://tvoj-domen.com/api/cron/run-migrations" \
  -H "Authorization: Bearer dev-cron-secret-12345"

# Trebalo bi 200 OK
```

---

### ✅ FAZA 8: Post-Deployment (ako je potrebno)

#### Ako vidim greške u Vercel logs:

**Greška: "Can't reach database server"**
- [ ] Proverim DATABASE_URL u Vercel UI
- [ ] Proverim da li production baza prihvata konekcije sa Vercel IP adresa
- [ ] Za Neon/Supabase, trebalo bi automatski biti dostupno

**Greška: "NEXTAUTH_SECRET is not set"**
- [ ] Proverim da je NEXTAUTH_SECRET postavljen u Vercel
- [ ] Proverim da nema razmaka ili specijalnih karaktera

**Greška: Migracije se ne pokrevaju**
- [ ] Proverim da CRON_SECRET u kodu `app/api/cron/run-migrations/route.ts` odgovara Vercel varijabli
- [ ] Čekaj do 04:00 UTC ili ručno pokreni curl komandu gore

---

## 📊 Sažetak šta se dešava

| Korak | Šta se dešava | Status |
|-------|-------------|--------|
| Build | `npx prisma generate && next build` | ✅ Bez baze |
| Deploy | Aplikacija je live na Vercel | ✅ Instant |
| Migracije | Cron job `/api/cron/run-migrations` daily 04:00 | ⏰ Automatski |
| Seed (opciono) | Test podaci u bazi | ⚙️ Ručno sa lokala |
| Email | Resend API slanje | ✅ Production key |
| Redis | Upstash cache | ✅ Ako konfigurisan |

---

## 🚨 Kritične stvari koje NE TREBA DA URADIŠ

❌ **NIKADA ne pushuj:**
- `.env.local` sa production vrednostima
- `.env` sa production vrednostima
- Bilo koji fajl sa API ključevima
- Bilo koji fajl sa database credentials

✅ **UMESTO TOGA:**
- Koristi Vercel UI za environment varijable
- Čuva sekrete samo u Vercel Project Settings
- Jedino `.env.example` može biti u git (bez vrednosti)

---

## 🔗 Korisni Linkovi

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth Production](https://next-auth.js.org/getting-started/example)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Supabase PostgreSQL](https://supabase.com/docs)

---

## 📞 Ako Nešto Pođe Po Zlu

1. **Checkout Vercel Deployment logs** → https://vercel.com/dashboard → projekat → Logs → Deployments
2. **Proverim environment varijable** → Settings → Environment Variables (trebalo bi da su `[protected]`)
3. **Testiraj migracije ručno:**
   ```bash
   DATABASE_URL="..." npx prisma migrate status
   ```
4. **Kontaktiraj Vercel support** ako je cloud issue

---

## ✅ Gotovo! 🎉

Kada sve bude green, aplikacija je live u produkciji sa:
- ✅ Production PostgreSQL baza
- ✅ Production security secrets
- ✅ Automatske migracije svakog dana
- ✅ Email slanje kroz Resend
- ✅ Redis cache kroz Upstash
- ✅ Zero downtime deployment

**Sretno!** 🚀
