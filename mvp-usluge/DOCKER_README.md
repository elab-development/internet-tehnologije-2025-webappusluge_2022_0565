# 🐳 Docker Setup - SVE U DOCKER-U

## Šta je potrebno

- [Docker Desktop za Windows](https://www.docker.com/products/docker-desktop)

## Kako koristiti

### 1. Prvo očisti stare kontejnere (ako postoje)

```cmd
docker-compose down -v
```

### 2. Pokreni SVE - baza i aplikacija

```cmd
docker-compose up -d
```

Čeka ~30-40 sekundi dok se grade i pokrenu kontejneri...

### 3. Proveri da su oba pokrenuta

```cmd
docker-compose ps
```

Trebalo bi da vidiš:
- ✅ mvp_usluge_postgres (healthy)
- ✅ mvp_usluge_app (healthy)

### 4. Otvori aplikaciju

```
http://localhost:3000
```

### 5. Zaustavi sve

```cmd
docker-compose down
```

---

## 📊 Šta se pokreće

| Servis | Port | Status |
|--------|------|--------|
| **PostgreSQL** | 5432 | ✅ U Dockeru |
| **Next.js App** | 3000 | ✅ U Dockeru |

**SVE U DOCKER-U** - Ništa lokalno osim Docker Desktop-a!

---

## 🔧 Ako trebaš čista baza

```cmd
docker-compose down -v
docker-compose up -d
```

Flag `-v` briše sve podatke. Novo počinje ispočetka.

---

## 📝 Environment varijable

Ako trebaš drugačije vrednosti, edit u `docker-compose.yml`:

```yaml
environment:
  RESEND_API_KEY: your-key
  CRON_SECRET: your-secret
```

---

## ✅ Gotovo!

```cmd
docker-compose up -d
```

Cela aplikacija (PostgreSQL + Next.js) je poput jednog klika! 🚀
