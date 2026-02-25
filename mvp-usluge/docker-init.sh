#!/bin/sh

echo "🚀 Initializing MVP Usluge application..."
echo ""

# Čekaj da baza bude spremna
echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if nc -z postgres 5432 2>/dev/null; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i/30 - waiting..."
  sleep 1
done

# Primeni šemu baze
echo ""
echo "📦 Applying database schema..."
./node_modules/.bin/prisma db push --skip-generate

if [ $? -eq 0 ]; then
  echo "✅ Database schema applied successfully"
else
  echo "⚠️  Schema application had issues (continuing...)"
fi

# Pokrenuti seed
echo ""
echo "🌱 Seeding database..."
npm run db:seed

if [ $? -eq 0 ]; then
  echo "✅ Database seeded successfully"
else
  echo "⚠️  Seed had issues (might already be seeded, continuing...)"
fi

# Startuj aplikaciju
echo ""
echo "▲ Starting Next.js application (production mode)..."
npm start
