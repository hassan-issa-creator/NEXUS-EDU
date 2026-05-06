#!/bin/bash

# ============================================
# Million Platform - Deploy Script
# Run this to deploy updates
# ============================================

set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/million-platform

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗃️ Running database migrations..."
cd apps/api
npx prisma migrate deploy --schema=../../prisma-backend/prisma/schema.prisma
cd ../..

# Build applications
echo "🔨 Building applications..."
npm run build

# Reload PM2 processes
echo "🔄 Reloading PM2 processes..."
pm2 reload ecosystem.config.js --env production

# Verify health
echo "🏥 Checking health..."
sleep 5
curl -f http://localhost:3001/api/health || echo "⚠️ API health check failed"
curl -f http://localhost:3000 || echo "⚠️ Web health check failed"

echo "✅ Deployment complete!"
