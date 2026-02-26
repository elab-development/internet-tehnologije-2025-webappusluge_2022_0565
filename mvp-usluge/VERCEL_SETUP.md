# 🚀 Vercel Production Setup za MVP Usluge

## Pregled

Ovaj dokument objašnjava kako konfigurisati projekat za Vercel production deployment sa drugačijim environment varijablama od lokalne razvojne sredine.

## Ključne razlike

| Aspekt | Lokalno | Docker | Vercel Production |
|--------|---------|--------|-------------------|
| Database | `localhost:5432` | `postgres:5432` (docker-compose) | Production PostgreSQL |
| Build | `npm run dev` | `Dockerfile` + `docker-init.sh` | `vercel.json` buildCommand |
| Migracije | Na startu dev servera | U `docker-init.sh` | Cron job `/api/cron/run-migrations` |
| Environment vars | `.env.local` | `.env` | Vercel Project Settings |

## ✅ Korak 1: Pripremi Production Database

Trebam ti production PostgreSQL baza. Opcije:

### Opcija A: Neon (Preporučeno za Vercel)
1. Idi na https://neon.tech
2. Kreiraj novi projekat
3. Kopiraj connection string
4. Connection string bi trebao biti:
   ```
   postgresql://user:password@host.neon.tech:5432/database?schema=public
   ```

### Opcija B: Supabase
1. Idi na https://supabase.com
2. Kreiraj novi projekat
3. Priključi se na Database pa kopiraj URL

### Opcija C: AWS RDS / Drugi provider
- Kreiraj PostgreSQL instancu
- Omogući javni pristup (ili koristi Vercel IP whitelist)
- Kopiraj connection string

## 📝 Korak 2: Postavi Environment Varijable u Vercel-u

### Automatski način (preporučeno):
```bash
# Pull sve environment varijable sa Vercel-a
vercel env pull .env.production.local

# Primeni kroz Vercel UI
vercel env add DATABASE_URL
```

### Ručno kroz UI:

1. **Idi na Vercel Dashboard**
   - https://vercel.com/dashboard
   - Klikni na tvoj projekt "mvp-usluge"

2. **Settings → Environment Variables**

3. **Dodaj sledeće varijable sa production vrednostima:**

```
DATABASE_URL = postgresql://...    (Tvoja production baza)
NEXTAUTH_SECRET = (generiši novog - vidiš ispod)
NEXTAUTH_URL = https://tvoj-domen.com
RESEND_API_KEY = re_...
RESEND_FROM_EMAIL = noreply@tvoj-domen.com
CRON_SECRET = (isti kao lokalno ili novi)
UPSTASH_REDIS_REST_URL = (ako koristiš Redis)
UPSTASH_REDIS_REST_TOKEN = (ako koristiš Redis)
NODE_ENV = production
```

### Generiši novi NEXTAUTH_SECRET za production:
```bash
# Na lokalnoj mašini, izvrši:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Kopiraj rezultat i postavi kao NEXTAUTH_SECRET u Vercel-u
```

## 🔄 Korak 3: Build Process

Tvoji `vercel.json` je sada ažuriran:

```json
{
    "buildCommand": "npx prisma generate && next build",
    "devCommand": "next dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "crons": [
        {
            "path": "/api/cron/send-reminders",
            "schedule": "0 8 * * *"
        },
        {
            "path": "/api/cron/verify-companies",
            "schedule": "0 3 * * *"
        },
        {
            "path": "/api/cron/run-migrations",
            "schedule": "0 4 * * *"
        }
    ]
}
```

**Šta se desava:**
1. ✅ `npx prisma generate` - Generiše Prisma Client (brzo, ne treba bazi)
2. ✅ `next build` - Builduje Next.js aplikaciju
3. ❌ `npx prisma migrate deploy` - **UKLONJEN** (ne može biti u build bez baze)

**Cron Schedule (Hobby plan - max 1x dnevno):**
- 🕘 04:00 - Pokreniti migracije (`run-migrations`)
- 🕐 08:00 - Poslati podsetnike (`send-reminders`)
- 🕒 03:00 - Verifikovati kompanije (`verify-companies`)

## 🔐 Korak 4: Pokretanje Migracija

Migracije se sada pokrevaju na **dva načina**:

### Opcija A: Automatski kroz Cron (PREPORUČENO)
- ⏰ Cron job `/api/cron/run-migrations` se pokreće **svaki dan u 04:00**
- **Zaštićeno** sa `CRON_SECRET` environment varijablom
- Hobby plan dozvoljava samo 1x dnevno izvršavanje

> ℹ️ **Hobby plan limitacija:** Ako trebaju migracije hitnije (npr. odmah nakon novog deploymenta), trebalo bi ručno pokrenuti ili upgradovati na Pro plan

### Opcija B: Ručno Pre Prvog Deploymenta
Ako imaš novi deployment sa migracijama i ne želiš da čekaš do sledećeg dana (04:00):

**Alternativa 1 - Ručno iz terminala:**
```bash
# Lokalno, izvrši migracije ručno:
DATABASE_URL="tvoja-production-baza" npx prisma migrate deploy
```

**Alternativa 2 - Kroz serverless funkciju:**
```bash
# Pokreni cron ručno
curl -X POST "https://tvoj-domen.com/api/cron/run-migrations" \
  -H "Authorization: Bearer your-cron-secret"
```

**Alternativa 3 - Upgrade na Vercel Pro**
- Ako trebaju česte migracije, Pro plan dozvolava više cron jobs po danu
- https://vercel.com/pricing

## 📋 Deploy Checklist

Pre nego što pushneš na production:

- [ ] Production PostgreSQL baza je ready
- [ ] DATABASE_URL je dodan u Vercel (ne u git!)
- [ ] NEXTAUTH_SECRET je generiš i dodan u Vercel
- [ ] NEXTAUTH_URL je postavljen na tvoj production domen
- [ ] CRON_SECRET je identičan ili drugačiji (ali siguran)
- [ ] Sve ostale API ključeve su production verzije
- [ ] `.env.local` i `.env` su u `.gitignore` (nikada ne pushuj!)

## 🚀 Deploy

```bash
# Iz root direktorijuma projekta
cd mvp-usluge

# Deploy na production
vercel --prod

# Vercel će:
# 1. Pokrenuti build proces (bez migracija)
# 2. Uploadovati built aplikaciju
# 3. Startovati serverless funkcije
# 4. U roku od 12 sati (ili ručno) pokrenuti migracije
```

## 🧪 Test Production Setup

Kada se deploy završi:

1. **Testiraj web aplikaciju:**
   ```
   https://tvoj-domen.com
   ```

2. **Ručno pokreni migracije (ako želiš sada):**
   ```bash
   # U Vercel CLI:
   vercel invoke "run-migrations"

   # Ili preko curl-a:
   curl -X GET "https://tvoj-domen.com/api/cron/run-migrations" \
     -H "Authorization: Bearer your-cron-secret"
   ```

3. **Proverite Vercel logs:**
   - https://vercel.com/dashboard → Projekt → Logs → Functions
   - Trebalo bi da vidiš `/api/cron/run-migrations` sa statusom success

## 🔧 Troubleshooting

### Problem: "Can't reach database server"
**Rešenje:**
- Proveri da li je `DATABASE_URL` ispravan u Vercel UI
- Proveri da li je production baza dostupna (firewall rules)
- Vercel trebalo bi da može pristupiti (AWS/Neon trebalo bi da dozvoli)

### Problem: "NEXTAUTH_SECRET is not set"
**Rešenje:**
- Proveri da li je `NEXTAUTH_SECRET` postavljen u Vercel Environment Variables
- Trebalo bi da bude prikazan sa `[protected]`

### Problem: Migracije se ne pokrevaju
**Rešenje:**
- Čekaj do sledećeg cron (svakih 12 sati)
- Ili ručno pokreni kroz Vercel invoke (vidiš gore)
- Proverite Vercel Functions logs

### Problem: "CRON_SECRET does not match"
**Rešenje:**
- Proveri da li je `CRON_SECRET` u Vercel identičan kodu u `route.ts`
- Vercel interno koristi secret za autentifikovanje cron jobova

## 📚 Dodatna Resursa

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Production Setup](https://next-auth.js.org/getting-started/example)
- [Neon PostgreSQL](https://neon.tech/docs)

## 📞 Brza Pomoć

**Lokalno razvijaj kao do sada:**
```bash
npm run dev  # Koristi .env.local sa localhost bazom
```

**Za Docker:**
```bash
docker-compose up  # Koristi .env sa docker-compose bazom
```

**Za Vercel Production:**
```bash
vercel --prod  # Koristi environment varijable iz Vercel UI
```

---

✅ **Sada su sve tri razvojne okruženja potpuno odvojena sa svojim konfiguracijom!**
