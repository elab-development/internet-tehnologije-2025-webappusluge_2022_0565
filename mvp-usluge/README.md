# 🎯 MVP Usluge - Platforma za Oglašavanje Uslužnih Aktivnosti

> Web aplikacija za povezivanje pružalaca usluga (samostalnih radnika i preduzeća) sa klijentima.

[![CI Pipeline](https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565/actions/workflows/ci.yml/badge.svg)](https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

---

## 📖 Opis Projekta

**MVP Usluge** je moderna web platforma koja omogućava:

- 🔍 **Korisnicima** - pretragu i zakazivanje usluga (frizerski saloni, popravke, konsultacije, itd.)
- 💼 **Samostalnim radnicima** - promociju svojih usluga, upravljanje kalendarom i rezervacijama
- 🏢 **Preduzećima** - upravljanje timom radnika, kolektivnim kalendarom i automatsku verifikaciju
- 🛡 **Administratorima** - potpunu kontrolu sistema, moderaciju sadržaja i analitiku

**Ključne funkcionalnosti:**
- Sistem autentifikacije sa 4 uloge (Korisnik, Samostalac, Preduzeće, Admin)
- Rezervacije sa potvrdom i ocenjivanjem
- Kalendar dostupnosti i automatska dodela radnika
- Email notifikacije (Resend API)
- Geolokacija i mapa pružalaca (OpenStreetMap/Leaflet)
- Sistem ocenjivanja (1-5 zvezdica) sa odgovorima
- Automatska verifikacija preduzeća (≥50 usluga, ocena ≥4.5)
- Admin dashboard sa analitikom i graficima

---

## 🛠 Tech Stack

### **Frontend**
- **Next.js 16** (App Router) - React framework sa SSR/SSG
- **React 19** - UI biblioteka
- **TypeScript** - Statička tipizacija
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Grafikoni i vizualizacija podataka
- **React Leaflet** - Interaktivne mape

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js v4** - Autentifikacija (JWT)
- **Prisma ORM** - Type-safe database client
- **Zod** - Schema validacija

### **Baza podataka**
- **PostgreSQL 15** - Relaciona baza
- **Neon** - Serverless PostgreSQL hosting

### **Eksterni servisi**
- **Resend** - Email notifikacije
- **OpenStreetMap/Nominatim** - Geolokacija
- **UploadThing** - Upload i skladištenje slika
- **Upstash Redis** - Keširanje i rate limiting

### **DevOps**
- **Docker & Docker Compose** - Kontejnerizacija
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Cloud hosting i deployment

---

## 📋 Prerequisites

Pre pokretanja projekta, potrebno je instalirati:

- **Node.js** 18.x ili noviji ([Download](https://nodejs.org/))
- **npm** 9.x ili noviji (dolazi sa Node.js)
- **PostgreSQL** 15.x ([Download](https://www.postgresql.org/download/)) ili Docker
- **Git** ([Download](https://git-scm.com/downloads))

**Opciono (za Docker setup):**
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))

---

## 🚀 Lokalno Pokretanje Aplikacije

### **1. Kloniranje repozitorijuma**

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565.git
cd internet-tehnologije-2025-webappusluge_2022_0565/mvp-usluge
```

### **2. Instalacija zavisnosti**

```bash
npm install
```

### **3. Konfiguracija environment varijabli**
Kreiraj .env.local fajl u mvp-usluge/ direktorijumu:

```bash
cp .env.example .env.local
```

Popuni .env.local sa sledećim vrednostima:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvp_usluge"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Email (Resend) - opciono za lokalni development
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Redis (Upstash) - opciono
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxx"
```

Generisanje NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### **4. Pokretanje PostgreSQL baze**
Opcija A: Lokalna PostgreSQL instalacija

```bash
# Kreiraj bazu
createdb mvp_usluge

# Ili putem psql
psql -U postgres
CREATE DATABASE mvp_usluge;
\q
```

Opcija B: Docker (brže i jednostavnije)

```bash
docker run --name mvp-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mvp_usluge \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### **5. Migracije i seed podataka**

```bash
# Pokreni Prisma migracije
npx prisma migrate dev

# Popuni bazu test podacima
npm run db:seed
```

### **6. Pokretanje development servera**

```bash
npm run dev
```

---

## 📂 Struktura Projekta

```text
mvp-usluge/
├── app/                # Next.js App Router (stranice i API rute)
├── components/         # Reusable React komponente
├── lib/               # Utility funkcije i zajednička logika
├── prisma/            # Baza podataka (schema i seed skripte)
├── public/            # Statički fajlovi (Slike, ikone)
├── types/             # TypeScript definicije tipova
└── .env.example       # Primer environment varijabli
```

---

## 🔑 Test Kredencijali

Nakon pokretanja seed skripte (`npm run db:seed`), možete koristiti sledeće test naloge:

| Uloga | Email | Lozinka |
| :--- | :--- | :--- |
| **Admin** | `admin@mvp.com` | `admin123` |
| **Klijent** | `marko@gmail.com` | `marko123` |
| **Samostalac** | `petar@frizer.com` | `petar123` |
| **Preduzeće** | `info@beautysalon.com` | `beauty123` |

---

## 🐳 Pokretanje sa Docker Compose

### **Preduslov:**
- Docker Desktop instaliran ([Download](https://www.docker.com/products/docker-desktop))

### **1. Kloniranje repozitorijuma**
```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565.git
cd internet-tehnologije-2025-webappusluge_2022_0565/mvp-usluge
```

### **2. Kreiranje `.env.local` fajla**

```bash
cp .env.example .env.local
```

Minimalna konfiguracija za Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/mvp_usluge"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this"
```

Generisanje NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### **3. Pokretanje aplikacije**
```bash
# Build i pokreni sve servise (PostgreSQL + Next.js)
docker-compose up --build

# Ili u detached mode (background)
docker-compose up -d --build
```
Aplikacija će biti dostupna na: http://localhost:3000

### **4. Migracije i seed podataka**
Opcija A: Automatski (preporučeno)
Migracije se automatski pokreću pri startu aplikacije.

Opcija B: Ručno
```bash
# Pokreni migracije
docker-compose exec app npx prisma migrate deploy

# Seed podatke
docker-compose exec app npx prisma db seed
```

### **5. Korisne Docker komande**
```bash
# Prikaz logova
docker-compose logs -f app

# Zaustavi servise
docker-compose down

# Zaustavi i obriši volumes (PAŽNJA: briše bazu!)
docker-compose down -v

# Rebuild samo app servisa
docker-compose up --build app

# Pristup PostgreSQL shell-u
docker-compose exec db psql -U postgres -d mvp_usluge

# Pristup app container shell-u
docker-compose exec app sh
```

### **6. Troubleshooting**
**Problem: Port 5432 već zauzet**
```bash
# Promeni port u docker-compose.yml
ports:
  - "5433:5432"  # Koristi 5433 umesto 5432

# Ažuriraj DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@db:5433/mvp_usluge"
```

**Problem: Migracije ne rade**
```bash
# Resetuj bazu i pokreni migracije ponovo
docker-compose down -v
docker-compose up --build
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

**Problem: App se ne pokreće**
```bash
# Proveri logove
docker-compose logs app

# Rebuild bez cache-a
docker-compose build --no-cache app
docker-compose up app
```


---

## 📖 API Dokumentacija

Kompletna REST API dokumentacija je dostupna putem Swagger UI.

### **Pristup dokumentaciji:**

- **Lokalno:** http://localhost:3000/docs
- **Production:** https://mvp-usluge.vercel.app/docs (biće dostupno nakon deploy-a)

### **OpenAPI JSON spec:**

- **Lokalno:** http://localhost:3000/api/docs
- **Production:** https://mvp-usluge.vercel.app/api/docs

### **Ključni endpoint-i:**

| Metod | Endpoint | Opis | Autentifikacija |
|-------|----------|------|-----------------|
| POST | `/api/auth/register` | Registracija | ❌ |
| POST | `/api/auth/signin` | Prijava | ❌ |
| GET | `/api/services` | Lista usluga | ❌ |
| POST | `/api/services` | Kreiranje usluge | ✅ (FREELANCER/COMPANY) |
| GET | `/api/bookings` | Moje rezervacije | ✅ |
| POST | `/api/bookings` | Kreiranje rezervacije | ✅ (CLIENT) |
| POST | `/api/reviews` | Kreiranje ocene | ✅ (CLIENT) |
| GET | `/api/categories` | Lista kategorija | ❌ |
| GET | `/api/health` | Health check | ❌ |

### **Autentifikacija:**

API koristi **JWT tokene** (NextAuth.js). Za zaštićene rute:

1. Prijavi se na `/api/auth/signin`
2. Dobij JWT token iz cookie-a (`next-auth.session-token`)
3. Koristi token u `Authorization` header-u:
   ```text
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

### **Response format:**

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Opciona poruka"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Opis greške",
  "errors": {
    "field": ["Validation error"]
  }
}
```

**Status kodovi:**
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 409 - Conflict
- 422 - Validation Error
- 500 - Internal Server Error
- 503 - Service Unavailable
## 📧 Email Notifikacije

Aplikacija koristi **Resend** za slanje email notifikacija.

### **Tipovi email-ova:**

| Događaj | Primalac | Trigger |
|---------|----------|---------|
| **Welcome Email** | Novi korisnik | Registracija |
| **Nova rezervacija** | Pružalac | Klijent zakazao termin |
| **Potvrda rezervacije** | Klijent | Pružalac potvrdio |
| **Otkazivanje** | Oba | Bilo ko otkazao |
| **Podsetnik 24h** | Klijent | Cron job (svaki dan u 09:00) |
| **Nova ocena** | Pružalac | Klijent ostavio ocenu |

### **Setup (Development):**

1. Registruj se na [Resend](https://resend.com/)
2. Kreiraj API key
3. Dodaj u `.env.local`:
```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="MVP Usluge <onboarding@resend.dev>"
```

### **Setup (Production):**

1. Verifikuj domen na Resend
2. Koristi custom email (npr. `noreply@mvp-usluge.com`)
3. Dodaj environment varijable na Vercel

### **Cron Job:**
GitHub Actions automatski pokreće `/api/cron/send-reminders` svaki dan u 09:00 UTC.

Ručno pokretanje:
1. Idi na GitHub → Actions
2. Odaberi "Send Booking Reminders"
3. Klikni "Run workflow"
