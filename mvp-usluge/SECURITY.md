# 🔒 Security Measures

Ovaj dokument opisuje bezbednosne mere implementirane u aplikaciji.

---

## 🛡 Implementirane Zaštite

### 1. **CSRF (Cross-Site Request Forgery)**

**Mere:**
- ✅ NextAuth.js automatska CSRF zaštita (CSRF token u cookie-ima)
- ✅ Origin/Referer header validacija u middleware-u
- ✅ SameSite cookie atribut (`lax`)
- ✅ Custom CSRF validacija za POST/PUT/DELETE zahteve

**Implementacija:**
- `/lib/csrf.ts` - CSRF validacija
- `/middleware.ts` - Primena na sve API rute

**Testiranje:**
```bash
# Pokušaj CSRF napada (trebalo bi da failuje)
curl -X POST http://localhost:3000/api/services \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

---

### 2. **XSS (Cross-Site Scripting)**

**Mere:**
- ✅ DOMPurify sanitizacija svih user input-a
- ✅ Content Security Policy (CSP) headers
- ✅ X-XSS-Protection header
- ✅ Escape HTML u email template-ima
- ✅ React automatski escape-uje JSX

**Implementacija:**
- `/lib/sanitize.ts` - `sanitizeHtml()`, `sanitizeText()`
- `/next.config.ts` - CSP headers
- Primena u: Reviews, Service descriptions, User bio

**Testiranje:**
```bash
# Pokušaj XSS napada (trebalo bi da se sanitizuje)
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "xxx",
    "rating": 5,
    "comment": "<script>alert(\"XSS\")</script>"
  }'
```

---

### 3. **IDOR (Insecure Direct Object Reference)**

**Mere:**
- ✅ Provera vlasništva resursa u svim API rutama
- ✅ UUID validacija
- ✅ Logging pokušaja neautorizovanog pristupa
- ✅ Različita prava pristupa po ulogama

**Implementacija:**
- Provera u svim `[id]` rutama:
    - `/api/services/[id]` - Samo vlasnik može menjati
    - `/api/bookings/[id]` - Samo klijent/pružalac mogu videti
    - `/api/reviews/[id]` - Samo autor može menjati

**Primer:**
```typescript
if (service.providerId !== user.id && user.role !== 'ADMIN') {
  console.warn(`IDOR attempt: User ${user.id} tried to modify service ${serviceId}`);
  return errorResponse('Forbidden', 403);
}
```

---

### 4. **SQL Injection**

**Mere:**
- ✅ Prisma ORM (automatski prepared statements)
- ✅ UUID validacija
- ✅ Zod schema validacija
- ✅ Detekcija SQL ključnih reči u input-u
- ✅ Escape special characters

**Implementacija:**
- `/lib/sanitize.ts` - `containsSQLInjection()`, `validateUUID()`
- Prisma automatski escape-uje sve upite

---

### 5. **Rate Limiting (Brute-Force zaštita)**

**Mere:**
- ✅ Upstash Redis rate limiting
- ✅ Različiti limiti za različite endpoint-e:
    - Auth: 5 pokušaja / 15 minuta
    - API: 100 zahteva / minuta
    - Create: 10 kreiranja / sat
- ✅ IP-based tracking
- ✅ Retry-After header

**Implementacija:**
- `/lib/rate-limit.ts` - Rate limiting middleware
- Primena u: `/api/auth/register`, `/api/auth/login`

---

### 6. **Security Headers**

**Implementirani header-i:**
- ✅ Strict-Transport-Security (HSTS)
- ✅ X-Frame-Options (Clickjacking zaštita)
- ✅ X-Content-Type-Options (MIME sniffing zaštita)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Content-Security-Policy (CSP)
- ✅ Permissions-Policy

**Implementacija:**
- `/next.config.ts` - `headers()` funkcija

---

### 7. **Dodatne Mere**
- ✅ Password hashing - bcrypt (10 rounds)
- ✅ JWT tokens - NextAuth.js (httpOnly cookies)
- ✅ Input validation - Zod schemas
- ✅ Error handling - Ne otkriva interne detalje
- ✅ Logging - Beleženje sumnjive aktivnosti
- ✅ Environment variables - Osetljivi podaci u .env
- ✅ HTTPS - Obavezno u produkciji (Vercel automatski)

---

## 📊 Security Checklist
- [x] CSRF zaštita
- [x] XSS zaštita
- [x] IDOR zaštita
- [x] SQL Injection zaštita
- [x] Rate Limiting
- [x] Security Headers
- [x] Password hashing
- [x] JWT tokens
- [x] Input validation
- [x] Error handling
- [x] Logging
- [x] HTTPS (production)

## 🚨 Reporting Security Issues
Ako pronađete bezbednosni propust, molimo vas da nas kontaktirate na:
**Email: security@mvp-usluge.com**
*NE otvarajte javni GitHub issue za bezbednosne probleme.*

## 📚 Reference
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/pages/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
