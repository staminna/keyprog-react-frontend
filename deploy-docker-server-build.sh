#!/bin/bash

# Docker Deployment - Build on Server (Faster)
# Builds the Docker image directly on the production server

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_HOST="keyprog.varrho.com"
SERVER_USER="root"
SSH_ALIAS="digitalocean"
IMAGE_NAME="keyprog-frontend"
IMAGE_TAG="latest"
CONTAINER_NAME="keyprog-frontend"
REMOTE_PORT="3000"
CONTAINER_PORT="3000"
BUILD_DIR="/tmp/keyprog-frontend-build"

echo -e "${BLUE}🐳 Docker Deployment - Server Build${NC}"
echo "======================================="
echo "  Server: $SERVER_HOST"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG"
echo ""

# Functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test SSH
echo -e "${BLUE}📡 Testing SSH connection...${NC}"
if ssh $SSH_ALIAS "echo 'SSH OK'" > /dev/null 2>&1; then
    print_status "SSH connection working"
else
    print_error "Cannot connect to server"
    exit 1
fi

# Sync source files to server
echo ""
echo -e "${BLUE}📦 Syncing source files to server...${NC}"
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '.env*' \
    ./ $SSH_ALIAS:$BUILD_DIR/

print_status "Files synced to server"

# Build on server
echo ""
echo -e "${BLUE}🔨 Building Docker image on server...${NC}"
ssh $SSH_ALIAS << ENDSSH
set -e

cd $BUILD_DIR

echo "🐳 Building image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

echo "🛑 Stopping old container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🔍 Checking for processes on port $REMOTE_PORT..."
docker ps -q --filter "publish=$REMOTE_PORT" | xargs -r docker stop 2>/dev/null || true
docker ps -aq --filter "publish=$REMOTE_PORT" | xargs -r docker rm 2>/dev/null || true

echo "🚀 Starting new container..."
docker run -d \\
  --name $CONTAINER_NAME \\
  --restart unless-stopped \\
  -p $REMOTE_PORT:$CONTAINER_PORT \\
  $IMAGE_NAME:$IMAGE_TAG

echo "🧹 Cleaning up..."
docker image prune -f
rm -rf $BUILD_DIR

echo "✅ Deployment complete!"
ENDSSH

# Verify
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
ssh $SSH_ALIAS << ENDSSH
echo "📊 Container status:"
docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📈 Container logs (last 10 lines):"
docker logs --tail 10 $CONTAINER_NAME
ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Information:${NC}"
echo "  Server: $SERVER_HOST"
echo "  Container: $CONTAINER_NAME"
echo "  Port: $REMOTE_PORT"
echo "  URL: http://$SERVER_HOST:$REMOTE_PORT"
echo ""
print_status "Deployment complete! 🎉"
