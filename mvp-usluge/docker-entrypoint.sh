#!/bin/sh
set -e

echo "🚀 Starting MVP Usluge application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed database if needed (only in development)
if [ "$NODE_ENV" = "development" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

echo "✅ Application is ready!"

# Start the application
exec "$@"
