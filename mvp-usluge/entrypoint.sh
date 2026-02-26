#!/bin/sh

echo "🚀 Initializing application..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
  if nc -z postgres 5432; then
    echo "✅ Database is ready!"
    break
  fi
  echo "Attempt $i/30 - Database not ready yet, waiting..."
  sleep 1
done

# Run migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy || true

# Run seed
echo "🌱 Seeding database..."
npx prisma db seed || npm run db:seed || true

# Start the application
echo "▲ Starting Next.js application..."
exec npm start
