#!/bin/bash

# Load env variables
if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g' | xargs) | envsubst)
fi

echo "🚀 Starting Deployment..."

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: Docker is not installed." >&2
  exit 1
fi

# Pull latest changes (if git repo)
if [ -d .git ]; then
  echo "📥 Pulling latest changes..."
  git pull
fi

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy

echo "✅ Deployment complete!"
echo "🌍 Your app is running at https://${DOMAIN_NAME:-localhost}"
