#!/bin/bash

# Docker-based Production Deployment Script
# Deploys React frontend as a Docker container to keyprog.varrho.com
#
# Usage:
#   ./deploy-docker.sh              # Interactive mode
#   ./deploy-docker.sh --yes        # Auto-confirm mode

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
REMOTE_PORT="3000"  # Port on server
CONTAINER_PORT="3000"  # Port inside container (serve runs on 3000)

echo -e "${BLUE}🐳 Docker Deployment - React Frontend${NC}"
echo "======================================="
echo "  Server: $SERVER_HOST"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG"
echo "  Container: $CONTAINER_NAME"
echo ""

# Functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check SSH connection
echo -e "${BLUE}📡 Testing SSH connection...${NC}"
if ssh $SSH_ALIAS "echo 'SSH OK'" > /dev/null 2>&1; then
    print_status "SSH connection working"
else
    print_error "Cannot connect to server"
    exit 1
fi

# Check Docker on server
echo -e "${BLUE}🐳 Checking Docker on server...${NC}"
if ssh $SSH_ALIAS "docker --version" > /dev/null 2>&1; then
    print_status "Docker is installed on server"
else
    print_error "Docker is not installed on server"
    print_warning "Install Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Confirm deployment
AUTO_CONFIRM=${1:-no}
if [ "$AUTO_CONFIRM" != "--yes" ] && [ "$AUTO_CONFIRM" != "-y" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Deploy to PRODUCTION?${NC}"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Build Docker image locally
echo ""
echo -e "${BLUE}🔨 Building Docker image locally...${NC}"
docker build --platform linux/amd64 -t $IMAGE_NAME:$IMAGE_TAG .

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi

print_status "Docker image built successfully"

# Save Docker image to tar
echo ""
echo -e "${BLUE}📦 Saving Docker image...${NC}"
docker save $IMAGE_NAME:$IMAGE_TAG | gzip > /tmp/${IMAGE_NAME}.tar.gz

print_status "Image saved to /tmp/${IMAGE_NAME}.tar.gz"

# Transfer image to server
echo ""
echo -e "${BLUE}🚀 Transferring image to server...${NC}"
rsync -avz --progress /tmp/${IMAGE_NAME}.tar.gz $SSH_ALIAS:/tmp/

print_status "Image transferred to server"

# Load image on server and deploy
echo ""
echo -e "${BLUE}🐳 Deploying container on server...${NC}"
ssh $SSH_ALIAS << ENDSSH
set -e

echo "📥 Loading Docker image..."
docker load < /tmp/${IMAGE_NAME}.tar.gz

echo "🛑 Stopping old container (if exists)..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🔍 Checking for processes on port $REMOTE_PORT..."
# Find and stop any container using port 3000
docker ps -q --filter "publish=$REMOTE_PORT" | xargs -r docker stop 2>/dev/null || true
docker ps -aq --filter "publish=$REMOTE_PORT" | xargs -r docker rm 2>/dev/null || true

echo "🚀 Starting new container..."
docker run -d \\
  --name $CONTAINER_NAME \\
  --restart unless-stopped \\
  -p $REMOTE_PORT:$CONTAINER_PORT \\
  $IMAGE_NAME:$IMAGE_TAG

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Container started successfully!"
ENDSSH

# Verify deployment
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
ssh $SSH_ALIAS << ENDSSH
echo "📊 Container status:"
docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📈 Container logs (last 10 lines):"
docker logs --tail 10 $CONTAINER_NAME
ENDSSH

# Cleanup local tar
rm -f /tmp/${IMAGE_NAME}.tar.gz

# Final info
echo ""
echo -e "${GREEN}✅ Docker deployment successful!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Information:${NC}"
echo "  Server: $SERVER_HOST"
echo "  Container: $CONTAINER_NAME"
echo "  Port: $REMOTE_PORT"
echo "  URL: http://$SERVER_HOST:$REMOTE_PORT"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo ""
echo "  View container logs:"
echo "    ssh $SSH_ALIAS 'docker logs -f $CONTAINER_NAME'"
echo ""
echo "  Restart container:"
echo "    ssh $SSH_ALIAS 'docker restart $CONTAINER_NAME'"
echo ""
echo "  Stop container:"
echo "    ssh $SSH_ALIAS 'docker stop $CONTAINER_NAME'"
echo ""
echo "  View container stats:"
echo "    ssh $SSH_ALIAS 'docker stats $CONTAINER_NAME'"
echo ""
echo "  Access container shell:"
echo "    ssh $SSH_ALIAS 'docker exec -it $CONTAINER_NAME sh'"
echo ""
print_status "Deployment complete! 🎉"
