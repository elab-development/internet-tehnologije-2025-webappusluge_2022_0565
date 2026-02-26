# 🧪 MVP Usluge - Ekstenzivni Testing Workflow

## 📋 Pregled

Ovaj dokument sadrži detaljne test slučajeve za sve API endpoint-e aplikacije. Svaki test je organizovan po domenama sa preciznim instrukcijama.

---

## 🔐 TEST KREDENCIJALI

### Korisnici dostupni za testiranje:

```
ADMIN
  Email: admin@mvp.com
  Password: admin123

CLIENT 1 (Marko)
  Email: marko@gmail.com
  Password: marko123

CLIENT 2 (Ana)
  Email: ana@gmail.com
  Password: ana123

FREELANCER 1 - Frizer (Petar)
  Email: petar@frizer.com
  Password: petar123

FREELANCER 2 - Vodoinstalater (Jovan)
  Email: jovan@vodovod.com
  Password: jovan123

COMPANY 1 - Beauty Salon (Elegance)
  Email: info@beautysalon.com
  Password: beauty123

COMPANY 2 - Home Repair Pro
  Email: info@homerepair.com
  Password: repair123
```

---

## 🌐 API BASE URLs

```
Development: http://localhost:3000/api
Production: https://mvp-usluge.vercel.app/api
Documentation: http://localhost:3000/api/docs
```

---

## ✅ TEST 1: AUTENTIFIKACIJA I REGISTRACIJA

### 1.1 Registracija Novog Korisnika

**Endpoint:** `POST /auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+381601234567",
    "role": "CLIENT"
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Vraća kreiranog korisnika (bez lozinke)
- ✅ Email verifikacioni link se šalje (ako je RESEND_API_KEY postavljen)

**Test slučajevi:**
- ✅ Registracija novog klijenta
- ✅ Registracija novog freelancera
- ✅ Registracija novog preduzeća (obavezno companyName i PIB)
- ✅ Greška: Email je već registrovan (409)
- ✅ Greška: Nevalidna email adresa
- ✅ Greška: Lozinka je prekratka
- ✅ Greška: Preduzeće bez companyName ili PIB

---

### 1.2 Provera Dostupnosti Email-a

**Endpoint:** `GET /auth/check-email?email=test@example.com`

```bash
curl http://localhost:3000/api/auth/check-email?email=marko@gmail.com
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ `available: false` za postojeće email
- ✅ `available: true` za nove email adrese

**Test slučajevi:**
- ✅ Provera postojećeg email-a (marko@gmail.com)
- ✅ Provera novog email-a
- ✅ Greška: Bez email parametra

---

### 1.3 Prijavljivanje (Login)

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login
```

**Očekivani rezultat:**
- ✅ Status 400 sa porukom da koristi /api/auth/signin umesto toga

**Napomena:** Prijavljivanje se vrši preko NextAuth.js (`/api/auth/signin`)

---

### 1.4 Verifikacija Email-a

**Endpoint:** `POST /auth/verify-email`

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "[JWT_TOKEN_IZ_EMAIL-a]"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ `isVerified: true`

**Test slučajevi:**
- ✅ Verifikacija sa validnim tokenom
- ✅ Greška: Nevalidan token
- ✅ Greška: Istekao token
- ✅ Greška: Email je već verifikovan

---

### 1.5 Zaboravljena Lozinka

**Endpoint:** `POST /auth/forgot-password`

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marko@gmail.com"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Email sa link-om za resetovanje (ako je RESEND_API_KEY postavljen)
- ✅ Poruka se vraća čak i ako email nije pronađen (bezbednost)

**Test slučajevi:**
- ✅ Zahtev za reset lozinke
- ✅ Greška: Bez email-a

---

### 1.6 Resetovanje Lozinke

**Endpoint:** `POST /auth/reset-password`

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "[JWT_TOKEN_IZ_FORGOT_PASSWORD_EMAIL-a]",
    "newPassword": "novaLozinka123"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Lozinka je promenjena

**Test slučajevi:**
- ✅ Resetovanje sa validnim tokenom
- ✅ Greška: Nevalidan ili istekao token
- ✅ Greška: Token je već iskorišćen (bezbenost)
- ✅ Greška: Lozinka prekratka (< 6 karaktera)

---

### 1.7 Sesija Korisnika

**Endpoint:** `GET /auth/session`

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
```

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/auth/session
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća korisnikove podatke (id, email, role, isVerified)

**Test slučajevi:**
- ✅ Sesija prijavljenog korisnika
- ✅ Greška: Bez JWT tokena (401)
- ✅ Greška: Nevalidan JWT token (401)

---

## 👤 TEST 2: PROFIL KORISNIKA

### 2.1 Preuzimanje Profila

**Endpoint:** `GET /profile`

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/profile
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća sve podatke korisnika

---

### 2.2 Ažuriranje Profila

**Endpoint:** `PUT /profile`

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marko",
    "lastName": "Marković",
    "phone": "+381601234567",
    "bio": "Novi bio",
    "city": "Beograd",
    "address": "Nova adresa 123",
    "profileImage": "https://example.com/image.jpg"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća ažurirane podatke

**Test slučajevi:**
- ✅ Ažuriranje imena
- ✅ Ažuriranje bio-a
- ✅ Ažuriranje slike profila
- ✅ Parcijalno ažuriranje (samo neka polja)
- ✅ Greška: Predugo polje (bio max 500 karaktera)

---

### 2.3 Deaktivacija Naloga

**Endpoint:** `DELETE /profile`

```bash
curl -X DELETE http://localhost:3000/api/profile \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ `isActive: false`

**Test slučajevi:**
- ✅ Deaktivacija naloga (soft delete)
- ✅ Greška: Bez autentifikacije (401)

---

## 🏢 TEST 3: KATEGORIJE

### 3.1 Preuzimanje Svih Kategorija

**Endpoint:** `GET /categories`

```bash
curl http://localhost:3000/api/categories
```

**Query parametri:**
- `parentId` - Filtriraj po roditeljskoj kategoriji
- `includeChildren` - Uključi podkategorije (default: true)

```bash
# Sve kategorije sa podkategorijama
curl http://localhost:3000/api/categories

# Samo root kategorije
curl "http://localhost:3000/api/categories?parentId=null"

# Podkategorije od specifične kategorije
curl "http://localhost:3000/api/categories?parentId=[CATEGORY_ID]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća sve kategorije sa hijerarhijom

---

### 3.2 Preuzimanje Jedne Kategorije

**Endpoint:** `GET /categories/{id}`

```bash
curl http://localhost:3000/api/categories/[CATEGORY_ID]
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća detalje kategorije sa uslugama

---

### 3.3 Kreiranje Kategorije (ADMIN)

**Endpoint:** `POST /categories`

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Kategorija",
    "slug": "nova-kategorija",
    "description": "Opis kategorije",
    "iconUrl": "🎨"
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Kreirana nova kategorija

**Test slučajevi:**
- ✅ Kreiranje root kategorije
- ✅ Kreiranje podkategorije sa parentId
- ✅ Greška: Bez autentifikacije (401)
- ✅ Greška: Nije ADMIN uloga (403)
- ✅ Greška: Slug već postoji (409)

---

### 3.4 Ažuriranje Kategorije (ADMIN)

**Endpoint:** `PUT /categories/{id}`

```bash
curl -X PUT http://localhost:3000/api/categories/[CATEGORY_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ažurirana Kategorija",
    "description": "Nova kopis"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Ažurirana kategorija

---

### 3.5 Brisanje Kategorije (ADMIN)

**Endpoint:** `DELETE /categories/{id}`

```bash
curl -X DELETE http://localhost:3000/api/categories/[CATEGORY_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Brisanje prazne kategorije
- ✅ Greška: Kategorija sa uslugama (400)
- ✅ Greška: Kategorija sa podkategorijama (400)

---

## 💼 TEST 4: USLUGE

### 4.1 Preuzimanje Svih Usluga (Javna)

**Endpoint:** `GET /services`

```bash
curl http://localhost:3000/api/services
```

**Query parametri:**
```
categoryId    - Filtriraj po kategoriji
providerId    - Filtriraj po pružaocu
search        - Pretraga po nazivu/opisu
minPrice      - Minimalna cena
maxPrice      - Maksimalna cena
minRating     - Minimalna prosečna ocena pružaoca
page          - Broj stranice (default: 1)
limit         - Broj rezultata po stranici (default: 10)
latitude      - Geografska širina (za geolokaciju)
longitude     - Geografska dužina (za geolokaciju)
radius        - Radijus pretrage u km (default: 50)
```

**Primeri:**

```bash
# Sve usluge
curl http://localhost:3000/api/services

# Usluge sa paginacijom
curl "http://localhost:3000/api/services?page=1&limit=20"

# Usluge određene kategorije
curl "http://localhost:3000/api/services?categoryId=[CATEGORY_ID]"

# Pretraga po названiju
curl "http://localhost:3000/api/services?search=šišanje"

# Filter po ceni
curl "http://localhost:3000/api/services?minPrice=1000&maxPrice=5000"

# Filter po oceni pružaoca
curl "http://localhost:3000/api/services?minRating=4.5"

# Geolokacijski search (najbliže usluge)
curl "http://localhost:3000/api/services?latitude=44.8176&longitude=20.4633&radius=10"

# Kombinovani filter
curl "http://localhost:3000/api/services?categoryId=[ID]&minPrice=1000&latitude=44.8176&longitude=20.4633&radius=50"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Lista usluga sa paginacijom
- ✅ Ako su prosleđene koordinate, vraća distancu od korisnika

---

### 4.2 Preuzimanje Jedne Usluge (Javna)

**Endpoint:** `GET /services/{id}`

```bash
curl http://localhost:3000/api/services/[SERVICE_ID]
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Detalji usluge sa provajderom i kategori​jom

---

### 4.3 Kreiranje Usluge (FREELANCER/COMPANY)

**Endpoint:** `POST /services`

```bash
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Muško šišanje + farbanje",
    "description": "Profesionalno šišanje sa farbanjem i stilizovanjem",
    "price": 3000,
    "pricingType": "FIXED",
    "duration": 90,
    "locationType": "ONSITE",
    "categoryId": "[CATEGORY_ID]"
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Kreirana nova usluga

**Test slučajevi:**
- ✅ Freelancer kreira uslugu
- ✅ Preduzeće kreira uslugu
- ✅ Greška: Nije FREELANCER ili COMPANY (403)
- ✅ Greška: Kategorija ne postoji (404)
- ✅ Greška: Dostignut limit usluga (400)

---

### 4.4 Ažuriranje Usluge

**Endpoint:** `PUT /services/{id}`

```bash
curl -X PUT http://localhost:3000/api/services/[SERVICE_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo ime",
    "price": 4000
  }'
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Vlasnik ažurira svoju uslugu
- ✅ Greška: Nije vlasnik usluge (403)
- ✅ Greška: Usluga ne postoji (404)

---

### 4.5 Brisanje Usluge

**Endpoint:** `DELETE /services/{id}`

```bash
curl -X DELETE http://localhost:3000/api/services/[SERVICE_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Vlasnik briše svoju uslugu
- ✅ Greška: Usluga sa aktivnim rezervacijama (400)
- ✅ Greška: Nije vlasnik usluge (403)

---

## 📅 TEST 5: REZERVACIJE

### 5.1 Preuzimanje Vaših Rezervacija

**Endpoint:** `GET /bookings`

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/bookings
```

**Query parametri:**
- `status` - PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED

```bash
# Sve vaše rezervacije
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/bookings

# Samo potvrđene rezervacije
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  "http://localhost:3000/api/bookings?status=CONFIRMED"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Klijent vidi svoje rezervacije, pružalac vidi rezervacije za svoje usluge

---

### 5.2 Preuzimanje Jedne Rezervacije

**Endpoint:** `GET /bookings/{id}`

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/bookings/[BOOKING_ID]
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Detalji rezervacije (samo ako imate pristup)

**Test slučajevi:**
- ✅ Klijent vidi svoju rezervaciju
- ✅ Pružalac vidi rezervaciju za svoju uslugu
- ✅ Greška: Nemate pristup (403)

---

### 5.3 Kreiranje Nove Rezervacije (CLIENT)

**Endpoint:** `POST /bookings`

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer [CLIENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "[SERVICE_ID]",
    "scheduledDate": "2025-03-10",
    "scheduledTime": "14:00",
    "clientNotes": "Molim da bude hitna intervencija"
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Kreirana rezervacija sa statusom PENDING

**Test slučajevi:**
- ✅ Klijent kreira rezervaciju
- ✅ Greška: Nije CLIENTE uloga (403)
- ✅ Greška: Pokušaj da zakaži svoju uslugu (400)
- ✅ Greška: Pružalac ne radi tog dana (400)
- ✅ Greška: Vreme nije u radnom vremenu (400)
- ✅ Greška: Dostignut limit od 10 aktivnih rezervacija (400)
- ✅ Greška: Klijent je banovan (403)

---

### 5.4 Ažuriranje Statusa Rezervacije

**Endpoint:** `PATCH /bookings/{id}`

```bash
curl -X PATCH http://localhost:3000/api/bookings/[BOOKING_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "providerNotes": "Konfirmovano za dati termin"
  }'
```

**Dozvoljene transicije statusa:**
```
PENDING      → CONFIRMED, REJECTED, CANCELLED
CONFIRMED   → COMPLETED, CANCELLED
COMPLETED   → (ZAVRŠENO - nema promene)
CANCELLED   → (ZAVRŠENO - nema promene)
REJECTED    → (ZAVRŠENO - nema promene)
```

**Test slučajevi - Pružalac:**
- ✅ Pružalac potvrđuje rezervaciju (PENDING → CONFIRMED)
- ✅ Pružalac odbija rezervaciju (PENDING → REJECTED)
- ✅ Pružalac završava rezervaciju (CONFIRMED → COMPLETED)

**Test slučajevi - Klijent:**
- ✅ Klijent otkazuje rezervaciju preko 24h pre termina
- ✅ Klijent otkazuje rezervaciju manje od 24h (dobija "strike")
- ✅ Klijent dobija ban nakon 3 strike-a (7 dana)

**Test slučajevi - Greške:**
- ✅ Greška: Nije vlasnik/klijent (403)
- ✅ Greška: Nevalidna transicija statusa (400)

---

### 5.5 Brisanje Rezervacije

**Endpoint:** `DELETE /bookings/{id}`

```bash
curl -X DELETE http://localhost:3000/api/bookings/[BOOKING_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Brisanje otkazane rezervacije
- ✅ Brisanje odbijene rezervacije
- ✅ Greška: Ne mogu obrisati aktivnu rezervaciju (400)

---

## ⭐ TEST 6: OCENE I RECENZIJE

### 6.1 Preuzimanje Ocena

**Endpoint:** `GET /reviews`

```bash
curl http://localhost:3000/api/reviews
```

**Query parametri:**
- `targetId` - Ocene za određenog pružaoca
- `serviceId` - Ocene za određenu uslugu

```bash
# Sve ocene za pružaoca
curl "http://localhost:3000/api/reviews?targetId=[USER_ID]"

# Sve ocene za uslugu
curl "http://localhost:3000/api/reviews?serviceId=[SERVICE_ID]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Lista ocena sa statistikom (prosek, distribucija)

---

### 6.2 Preuzimanje Jedne Ocene

**Endpoint:** `GET /reviews/{id}`

```bash
curl http://localhost:3000/api/reviews/[REVIEW_ID]
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Detalji ocene sa odgovorom (ako postoji)

---

### 6.3 Kreiranje Nove Ocene (CLIENT)

**Endpoint:** `POST /reviews`

⚠️ **USLOVI:**
- Rezervacija mora biti sa statusom COMPLETED
- Može se oceniti samo do 7 dana nakon završetka
- Samo jedan klijent može oceniti jednu rezervaciju

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer [CLIENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "[BOOKING_ID]",
    "rating": 5,
    "comment": "Odličan servis! Veoma sam zadovoljan."
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Kreirana ocena

**Test slučajevi - Nedoocenjene Rezervacije:**

Ove rezervacije su dostupne u seed bazi za testiranje:

1. **Muško šišanje** (client1 → freelancer1)
   - Booking ID iz `GET /api/bookings` (client1 - freelancer1 - Muško šišanje)

2. **Manikir** (client2 → company1)
   - Booking ID iz `GET /api/bookings` (client2 - company1 - Manikir)

3. **Žensko šišanje** (client2 → freelancer1)
   - Booking ID iz `GET /api/bookings` (client2 - freelancer1 - Žensko šišanje)

4. **Popravka slavine** (client1 → freelancer2)
   - Booking ID iz `GET /api/bookings` (client1 - freelancer2 - Popravka slavine)

5. **Tretman lica** (client1 → company1)
   - Booking ID iz `GET /api/bookings` (client1 - company1 - Tretman lica)

6. **Čišćenje odvoda** (client2 → freelancer2)
   - Booking ID iz `GET /api/bookings` (client2 - freelancer2 - Čišćenje odvoda)

**Test slučajevi - Greške:**
- ✅ Greška: Nije CLIENTE (403)
- ✅ Greška: Rezervacija nije COMPLETED (400)
- ✅ Greška: Prošlo je više od 7 dana (400)
- ✅ Greška: Već postoji ocena za ovu rezervaciju (409)

---

### 6.4 Ažuriranje Ocene (CLIENT) ili Odgovora (PROVIDER)

**Endpoint:** `PATCH /reviews/{id}`

**Klijent - Ažurira svoju ocenu (do 7 dana):**

```bash
curl -X PATCH http://localhost:3000/api/reviews/[REVIEW_ID] \
  -H "Authorization: Bearer [CLIENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Revidiram - servis je bio dobar ali sa manjim greškama"
  }'
```

**Pružalac - Dodaje odgovor na ocenu:**

```bash
curl -X PATCH http://localhost:3000/api/reviews/[REVIEW_ID] \
  -H "Authorization: Bearer [PROVIDER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Hvala vam na povratnoj informaciji! Ispravljamo to u budućnosti."
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Ažurirana ocena/odgovor

**Test slučajevi:**
- ✅ Klijent ažurira svoju ocenu
- ✅ Pružalac dodaje odgovor
- ✅ Greška: Nije autor/pružalac (403)
- ✅ Greška: Prošlo je više od 7 dana (400)

---

### 6.5 Brisanje Ocene

**Endpoint:** `DELETE /reviews/{id}`

```bash
curl -X DELETE http://localhost:3000/api/reviews/[REVIEW_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Autor briše svoju ocenu (do 7 dana)
- ✅ Admin briše bilo čiju ocenu
- ✅ Greška: Nije autor ili admin (403)
- ✅ Greška: Prošlo je više od 7 dana (400)

---

### 6.6 Prijava Neprikladne Ocene

**Endpoint:** `POST /reviews/{id}/report`

```bash
curl -X POST http://localhost:3000/api/reviews/[REVIEW_ID]/report \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Ocena je prijavljena za pregled

**Test slučajevi:**
- ✅ Prijava neprikladne ocene
- ✅ Greška: Ocena ne postoji (404)

---

## 👷 TEST 7: RADNICI (COMPANY ONLY)

### 7.1 Preuzimanje Vaših Radnika

**Endpoint:** `GET /workers`

```bash
curl -H "Authorization: Bearer [COMPANY_TOKEN]" \
  http://localhost:3000/api/workers
```

**Query parametri:**
- `isActive` - true/false za filtriranje

```bash
# Samo aktivni radnici
curl -H "Authorization: Bearer [COMPANY_TOKEN]" \
  "http://localhost:3000/api/workers?isActive=true"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Lista radnika preduzeća

---

### 7.2 Preuzimanje Jednog Radnika

**Endpoint:** `GET /workers/{id}`

```bash
curl -H "Authorization: Bearer [COMPANY_TOKEN]" \
  http://localhost:3000/api/workers/[WORKER_ID]
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Detalji radnika sa rezervacijama

---

### 7.3 Dodavanje Novog Radnika

**Endpoint:** `POST /workers`

```bash
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer [COMPANY_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Marija",
    "lastName": "Marić",
    "email": "marija@company.com",
    "phone": "+381601234567",
    "position": "Senior frizerka",
    "specializations": ["Šišanje", "Farbanje", "Tretmani"],
    "profileImage": "https://example.com/image.jpg"
  }'
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Kreiran novi radnik

**Test slučajevi:**
- ✅ Dodavanje novog radnika
- ✅ Greška: Nije COMPANY uloga (403)
- ✅ Greška: Dostignut limit od 100 radnika (400)

---

### 7.4 Ažuriranje Radnika

**Endpoint:** `PATCH /workers/{id}`

```bash
curl -X PATCH http://localhost:3000/api/workers/[WORKER_ID] \
  -H "Authorization: Bearer [COMPANY_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Lead frizerka",
    "specializations": ["Šišanje", "Farbanje"]
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Ažurirani podaci radnika

---

### 7.5 Brisanje Radnika

**Endpoint:** `DELETE /workers/{id}`

```bash
curl -X DELETE http://localhost:3000/api/workers/[WORKER_ID] \
  -H "Authorization: Bearer [COMPANY_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

**Test slučajevi:**
- ✅ Brisanje radnika bez aktivnih rezervacija
- ✅ Greška: Radnik ima aktivne rezervacije (400)

---

## 📅 TEST 8: RADNA VREMENA I DOSTUPNOST

### 8.1 Preuzimanje Radnog Vremena

**Endpoint:** `GET /calendar/working-hours`

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/calendar/working-hours
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Radno vreme po danima (0-6, gde je 0 = nedelja)

---

### 8.2 Dodavanje Radnog Vremena

**Endpoint:** `POST /calendar/working-hours`

```bash
curl -X POST http://localhost:3000/api/calendar/working-hours \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "isActive": true
  }'
```

**Parametri dayOfWeek:**
```
0 = Nedelja
1 = Ponedeljak
2 = Utorak
3 = Sreda
4 = Četvrtak
5 = Petak
6 = Subota
```

**Očekivani rezultat:**
- ✅ Status 201
- ✅ Dodano radno vreme

**Test slučajevi:**
- ✅ Dodavanje ne-preklapajućeg vremena
- ✅ Greška: Preklapajuće vreme (400)

---

### 8.3 Ažuriranje Postavki Kalendara

**Endpoint:** `PATCH /calendar/working-hours`

```bash
curl -X PATCH http://localhost:3000/api/calendar/working-hours \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "slotDuration": 30
  }'
```

**Dozvoljene vrednosti slotDuration:**
```
15, 30, 45, 60, 90, 120 (minuta)
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Ažurirana trajanja termina

---

### 8.4 Brisanje Radnog Vremena

**Endpoint:** `DELETE /calendar/working-hours/{id}`

```bash
curl -X DELETE http://localhost:3000/api/calendar/working-hours/[SLOT_ID] \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Očekivani rezultat:**
- ✅ Status 200

---

### 8.5 Preuzimanje Dostupnih Termina

**Endpoint:** `GET /calendar/availability`

```bash
curl "http://localhost:3000/api/calendar/availability?providerId=[PROVIDER_ID]&date=2025-03-10&duration=60"
```

**Query parametri (obavezni):**
- `providerId` - ID pružaoca
- `date` - Datum u formatu YYYY-MM-DD

**Query parametri (opcioni):**
- `duration` - Trajanje termina u minutama (default: 60)

```bash
# Dostupni termini za određenog pružaoca
curl "http://localhost:3000/api/calendar/availability?providerId=[PROVIDER_ID]&date=2025-03-10"

# Sa specifičnim trajanjem
curl "http://localhost:3000/api/calendar/availability?providerId=[PROVIDER_ID]&date=2025-03-10&duration=90"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Dostupni termini sa pažnjom na rezervacije

**Test slučajevi:**
- ✅ Preuzimanje dostupnih termina za dan kada pružalac radi
- ✅ Greška: Pružalac ne radi tog dana (vraća praznu listu)

---

## 👨‍💼 TEST 9: ADMIN OPERACIJE

### 9.1 Preuzimanje Svih Korisnika

**Endpoint:** `GET /admin/users`

```bash
curl -H "Authorization: Bearer [ADMIN_TOKEN]" \
  http://localhost:3000/api/admin/users
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Lista svih korisnika sa detaljima

**Test slučajevi:**
- ✅ Admin vidi sve korisnike
- ✅ Greška: Nije ADMIN uloga (403)

---

### 9.2 Aktivacija/Deaktivacija Korisnika

**Endpoint:** `PATCH /admin/users/{id}`

```bash
curl -X PATCH http://localhost:3000/api/admin/users/[USER_ID] \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Korisnik je deaktiviran

**Test slučajevi:**
- ✅ Admin deaktivira korisnika
- ✅ Greška: Ne može deaktivirati sebe (400)

---

## 🔍 TEST 10: ANALITIKA

### 10.1 Preuzimanje Analitike

**Endpoint:** `GET /analytics`

```bash
curl -H "Authorization: Bearer [JWT_TOKEN]" \
  http://localhost:3000/api/analytics
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Analitika rezervacija, prihoda i ocena (samo za pružaoce/admin)

**Test slučajevi:**
- ✅ Pružalac vidi svoju analitiku
- ✅ Admin vidi analitiku svih
- ✅ Klijent nema pristupa (403)

---

## 🌍 TEST 11: GEOLOKACIJA

### 11.1 Geocoding (Adresa → Koordinate)

**Endpoint:** `POST /geocode`

```bash
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Knez Mihailova 15, Beograd"
  }'
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća koordinate (latitude, longitude, displayName)

**Test slučajevi:**
- ✅ Geocoding validne adrese
- ✅ Greška: Adresa nije pronađena (404)

---

## 🏥 TEST 12: HEALTH CHECK

### 12.1 Provera Zdravlja Aplikacije

**Endpoint:** `GET /health`

```bash
curl http://localhost:3000/api/health
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ `status: "healthy"`
- ✅ `database: "connected"`
- ✅ `uptime: [broj_sekundi]`

---

## ⏰ TEST 13: CRON JOBS

### 13.1 Slanje Podsetnika

**Endpoint:** `POST /cron/send-reminders`

**Napomena:** Zahteva CRON_SECRET iz `.env` fajla

```bash
curl -X POST http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Podsetnike su poslati za rezervacije sutra
- ✅ Vraća broj poslanih podsetnika

---

### 13.2 Verifikacija Preduzeća

**Endpoint:** `GET/POST /cron/verify-companies`

```bash
curl -X GET http://localhost:3000/api/cron/verify-companies \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Preduzeća su verifikovana
- ✅ Vraća rezultate verifikacije

---

## 📚 TEST 14: DOKUMENTACIJA

### 14.1 OpenAPI Swagger Specifikacija

**Endpoint:** `GET /docs`

```bash
curl http://localhost:3000/api/docs
```

**Očekivani rezultat:**
- ✅ Status 200
- ✅ Vraća OpenAPI 3.0.0 specifikaciju u JSON-u

