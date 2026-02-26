# ========== BUILD STAGE ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client (use local prisma from node_modules)
RUN ./node_modules/.bin/prisma generate

# Copy source code
COPY . .

# Build for production
RUN NODE_ENV=production npm run build

# ========== RUNTIME STAGE ==========
FROM node:20-alpine

WORKDIR /app

# Install netcat for database readiness check
RUN apk add --no-cache netcat-openbsd

# Install only production dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy prisma schema
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy init script
COPY docker-init.sh /app/docker-init.sh
RUN chmod +x /app/docker-init.sh

EXPOSE 3000

# Run init script that handles migrations, seed, and starts app
CMD ["/app/docker-init.sh"]
