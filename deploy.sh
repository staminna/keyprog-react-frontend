#!/bin/bash

# Deploy script for Keyprog React Frontend
echo "🚀 Starting deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build new image
echo "🔨 Building new Docker image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start containers
echo "🚀 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Clean up unused Docker resources
echo "🧹 Cleaning up Docker resources..."
docker system prune -f

# Check if containers are running
echo "✅ Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 Deployment complete!"
echo "🌐 Your app should be available at: http://localhost:3000"
