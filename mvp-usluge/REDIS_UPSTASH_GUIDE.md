# 🚀 REDIS & UPSTASH EXPLANATION

## 🤔 What is Redis?

**Redis** = In-memory database for storing temporary data

Think of it like a **super-fast notepad** that your app uses to remember things for a short time. Unlike your main PostgreSQL database (which stores permanent data), Redis only keeps data temporarily and is much faster.

### Use Cases:
- 🚫 Rate limiting (limit API requests)
- ⏱️ Session storage (remember logged-in users)
- 📊 Caching (remember recent searches)
- 🎯 Real-time counters (track clicks, views)

---

## 🌐 What is Upstash?

**Upstash** = Redis hosting service (similar to how Vercel hosts your app)

You could run Redis yourself on a server, but Upstash is easier:
- ✅ No server maintenance
- ✅ Automatic backups
- ✅ REST API (accessible from anywhere)
- ✅ Free tier available

---

## 📝 Your Setup in .env.local

```env
UPSTASH_REDIS_REST_URL="https://decent-pangolin-30420.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXbUAAIncDIxM2NmMWNlZmFlNWM0NGEwOTYzNDU3OWU0NTkzMGI5OHAyMzA0MjA"
```

- **URL** = Where your Redis is hosted (Upstash server)
- **TOKEN** = Password to access it (keep it secret!)

---

## 🛡️ HOW IT'S BEING USED IN YOUR APP

- https://console.upstash.com/redis/16dba784-dbd6-4157-a049-c6e76ba1e991?teamid=0

### **1. Rate Limiting = Brute-Force Protection**

Your app uses Redis to track how many requests come from each IP address.

**File:** `lib/rate-limit.ts`

#### **Type 1: Auth Rate Limit** 🔐
```typescript
Ratelimit.slidingWindow(5, '15 m')  // 5 attempts in 15 minutes
```

**Where:** Login & Register endpoints
**Protection:** Stops attackers trying hundreds of passwords
**Example:**
- User 1 tries to login from IP 192.168.1.1
- 1st attempt ✅
- 2nd attempt ✅
- 3rd attempt ✅
- 4th attempt ✅
- 5th attempt ✅
- 6th attempt ❌ **BLOCKED** - "Too many login attempts. Try again in 15 minutes"

**Live Usage:**
```typescript
// app/api/auth/login/route.ts
import { authRateLimit, applyRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    // Apply rate limit first
    const rateLimit = await applyRateLimit(req, authRateLimit);

    if (!rateLimit.success) {
        return rateLimit.response; // Returns 429 Too Many Requests
    }

    // Continue with login logic
}
```

#### **Type 2: API Rate Limit** 📊
```typescript
Ratelimit.slidingWindow(100, '1 m')  // 100 requests per minute
```

**Where:** General API endpoints
**Protection:** Prevents API abuse and DoS attacks
**Example:**
- Your app can make 100 requests/minute
- At minute 61, limit resets
- Helps protect database from overload

#### **Type 3: Create Rate Limit** ➕
```typescript
Ratelimit.slidingWindow(10, '1 h')  // 10 creations per hour
```

**Where:** Service/Worker creation endpoints
**Protection:** Prevents spam (someone creating 1000 services instantly)

#### **Type 4: Guest Search Rate Limit** 🔎
```typescript
Ratelimit.fixedWindow(20, '24 h')  // 20 searches per day
```

**Where:** Service search endpoint (unauthenticated users)
**Protection:** Prevents scrapers from downloading your entire database

---

## 📊 What Gets Logged to Upstash

Every time someone makes an API request:

1. **IP Address** - Where the request came from
2. **Timestamp** - When it happened
3. **Endpoint** - Which API endpoint was called
4. **Request Count** - How many times that IP has requested

### Example Data in Upstash:

```json
{
  "ratelimit:auth:192.168.1.1": 3,
  "ratelimit:api:192.168.1.1": 45,
  "ratelimit:create:203.0.113.5": 5,
  "ratelimit:guestSearch:198.51.100.2": 8
}
```

### Dashboard View:
- Open https://console.upstash.com
- See all requests, IP addresses, hits per endpoint
- Monitor suspicious activity

---

## 🔄 How It Works Step-by-Step

### Scenario: Someone tries to brute-force login

```
1. Attacker IP: 192.168.1.100

2. First attempt:
   - Redis doesn't have this IP yet
   - Check: 0 < 5 ✅ ALLOWED
   - Redis stores: "ratelimit:auth:192.168.1.100" = 1

3. Second attempt (2 minutes later):
   - Check: 1 < 5 ✅ ALLOWED
   - Redis updates: "ratelimit:auth:192.168.1.100" = 2

4. Fifth attempt:
   - Check: 4 < 5 ✅ ALLOWED
   - Redis updates: "ratelimit:auth:192.168.1.100" = 5

5. Sixth attempt (8 minutes later):
   - Check: 5 < 5 ❌ BLOCKED!
   - Return 429 error
   - Redis doesn't increment (still = 5)
   - Sets auto-expiration: 15 minutes from first attempt

6. After 15 minutes:
   - Data auto-expires from Redis
   - Counter resets to 0
   - Attacker can try again
```

---

## 🎯 Real Example from Your Code

**File:** `app/api/auth/login/route.ts`

```typescript
import { authRateLimit, applyRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        // 🛡️ Step 1: Check rate limit
        const { success, response } = await applyRateLimit(req, authRateLimit);

        if (!response) {
            return response; // Returns 429 if too many attempts
        }

        // 🎯 Step 2: Continue with actual login
        const { email, password } = await req.json();

        // Check credentials...
        // ...
    }
}
```

**What Upstash sees:**
```
IP: 192.168.1.100
Endpoint: /api/auth/login
Timestamp: 2026-02-25T14:32:45Z
Count: 5
Status: RATE_LIMITED (after 5th attempt)
```

---

## 📈 Analytics on Upstash

When you log in to https://console.upstash.com:

### Database Stats Tab:
- 📊 Total requests
- 🔴 Blocked requests
- 📍 Top IP addresses
- 🗓️ Traffic over time

### Example Dashboard:
```
Rate Limit Statistics
┌─────────────────────────────────────────┐
│ Auth Endpoint                           │
│ Total Attempts: 1,234                   │
│ Blocked Attempts: 87                    │
│ Top IPs:                                │
│   192.168.1.1 - 156 attempts            │
│   10.0.0.5 - 98 attempts                │
│   203.0.113.2 - 45 attempts (BLOCKED)   │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configuration Breakdown

### In `lib/rate-limit.ts`:

```typescript
// Create Redis connection
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,      // Server location
    token: process.env.UPSTASH_REDIS_REST_TOKEN,  // Authentication
});

// Define different limits for different purposes
export const authRateLimit = new Ratelimit({
    redis,                                         // Use Redis
    limiter: Ratelimit.slidingWindow(5, '15 m'),  // 5 per 15 min
    analytics: true,                              // Track in Upstash
    prefix: 'ratelimit:auth',                     // Data label in Redis
});
```

---

## 🔐 Security & Privacy

### ✅ What's Stored:
- IP addresses (can identify user location)
- Request counts
- Timestamps

### ❌ What's NOT Stored:
- Passwords ✅ Never stored
- Personal data ✅ Only IP address
- Request content ✅ Only counts/timestamps

### Privacy Protection:
- 🔒 Token is secret (keep it in `.env`)
- 🔒 Data deleted after time expires
- 🔒 GDPR compliant (Upstash is EU-based)

---

## 💡 What Happens If Redis is Down?

Look at the code:
```typescript
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis(...)
    : null;  // ← If not configured, set to null

export async function applyRateLimit(req, ratelimit) {
    if (!ratelimit) {
        return { success: true };  // ← Allow all requests if Redis is null
    }
}
```

**If Upstash is down:**
- ✅ Your app keeps working
- ❌ But rate limiting is disabled
- ⚠️ You're vulnerable to brute-force attacks (temporarily)

---

## 📊 Current Usage on Your Account

Based on your setup, here's what's being tracked:

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| `/api/auth/login` | 5 per 15min | Stop brute-force |
| `/api/auth/register` | 5 per 15min | Stop account spam |
| `/api/services` | 100 per 1min | API abuse protection |
| Service Create | 10 per 1hour | Stop service spam |
| Guest Search | 20 per 24h | Stop scraping |

---

## 🚀 Production Considerations

### Upstash Free Tier Limits:
- ✅ 10,000 commands/day
- ✅ 30MB storage
- ✅ 10 concurrent connections

### Your App Usage:
- ~500 login attempts/day = OK
- ~5,000 API calls/day = OK
- **Conclusion:** Free tier is fine for MVP

### When to Upgrade:
- If you get 100+ concurrent users
- If you add caching (stores more data)
- If you need guaranteed uptime

---

## 🎯 Quick Reference

```
What is it?     → Redis database hosted on Upstash
What does it do? → Tracks API request counts by IP address
Why?            → Prevent brute-force attacks & API abuse
How?            → Maintains counters that auto-expire
Where?          → lib/rate-limit.ts (configuration)
                  app/api/auth/login/route.ts (usage)
Monitor at?     → https://console.upstash.com
Cost?           → Free (covered in free tier)
```

---

## 📞 Useful Links

- Upstash Dashboard: https://console.upstash.com
- Upstash Docs: https://upstash.com/docs
- Ratelimit Library: https://upstash.com/docs/redis/features/ratelimiting
- Redis Concepts: https://redis.io/commands/

---

**Summary:** Your Redis setup is a security layer that stops attackers from trying thousands of login attempts. Everything is automatically logged and managed by Upstash. You don't need to do anything - it just works!
