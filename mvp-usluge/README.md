# 🎯 MVP Usluge - Platforma za Oglašavanje Uslužnih Aktivnosti

> Web aplikacija za povezivanje pružalaca usluga (samostalnih radnika i preduzeća) sa klijentima.

[![CI Pipeline](https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565/actions/workflows/ci.yml/badge.svg)](https://github.com/elab-development/internet-tehnologije-2025-webappusluge_2022_0565/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## 🐳 Docker Setup

*(Sekcija će biti popunjena nakon implementacije Docker konfiguracije)*

---

## 📖 API Dokumentacija

*(Sekcija će biti popunjena nakon implementacije Swagger dokumentacije)*