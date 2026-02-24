# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

# Instaliraj libc6-compat za kompatibilnost sa Alpine Linux-om
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Kopiraj package.json i package-lock.json
COPY package*.json ./
COPY public ./public

# Instaliraj dependencies
RUN npm install --omit=dev --legacy-peer-deps

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Kopiraj dependencies iz prethodnog stage-a
COPY --from=deps /app/node_modules ./node_modules

# Kopiraj ceo projekat
COPY . .

# Generiši Prisma Client
RUN npm install -g prisma@6
RUN prisma generate

# Build Next.js aplikaciju
# Disable telemetry tokom build-a
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:22-alpine AS runner

WORKDIR /app

# Kreiraj non-root korisnika za sigurnost
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiraj public folder
COPY --from=builder /app/public ./public

# Kopiraj built aplikaciju
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kopiraj Prisma schema i migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prebaci se na non-root korisnika
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Startuj aplikaciju
CMD ["node", "server.js"]
