#!/bin/bash

# Frontend Deployment Script (React)
set -e

echo "🚀 Deploying React Frontend..."

# Stop existing frontend
echo "🛑 Stopping existing frontend..."
docker-compose -f docker-compose.frontend.yml --env-file .env.frontend down

# Build frontend
echo "🔨 Building React frontend..."
docker-compose -f docker-compose.frontend.yml --env-file .env.frontend build --no-cache

# Start frontend
echo "▶️ Starting React frontend..."
docker-compose -f docker-compose.frontend.yml --env-file .env.frontend up -d

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 15

# Health check
echo "🏥 Running health check..."
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ React Frontend is healthy"
else
    echo "❌ React Frontend health check failed"
fi

echo ""
echo "🎉 Frontend deployment completed!"
echo "📊 Access URLs:"
echo "  - React Frontend: http://localhost:3000"
echo "  - Production URL: https://keyprog.varrho.com"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.frontend.yml logs -f"
echo "  - Stop: docker-compose -f docker-compose.frontend.yml down"
