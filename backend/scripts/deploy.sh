#!/bin/bash

# Sociogram Backend Deployment Script
echo "🚀 Starting Sociogram backend deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (creates tables if they don't exist)
echo "🗄️ Setting up database schema..."
npx prisma db push --accept-data-loss

# Check if database needs seeding
echo "🔍 Checking database status..."
USERS_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null || echo "0")

if [ "$USERS_COUNT" = "0" ] || [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database with initial data..."
    node utils/runFullSeed.js
else
    echo "📊 Database already has data, skipping seed"
fi

echo "✅ Backend deployment complete!"
echo "🔗 Database URL configured: ${DATABASE_URL:0:30}..."
