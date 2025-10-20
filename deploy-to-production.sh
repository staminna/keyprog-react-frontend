#!/bin/bash

# React Frontend Production Deployment Script
# Deploys to keyprog.varrho.com:/home/keyprog/keyprog-frontend
#
# Usage:
#   ./deploy-to-production.sh         # Interactive mode (asks for confirmation)
#   ./deploy-to-production.sh --yes   # Auto-confirm mode (for CI/CD)
#   ./deploy-to-production.sh -y      # Auto-confirm mode (short flag)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_HOST="keyprog.varrho.com"
SERVER_USER="nunes"
DEPLOY_PATH="/home/keyprog/keyprog-frontend"
SSH_ALIAS="digitalocean"

echo -e "${BLUE}🚀 Deploying React Frontend to Production Server${NC}"
echo "=================================="
echo "  Server: $SERVER_HOST"
echo "  Path: $DEPLOY_PATH"
echo "  SSH: $SSH_ALIAS"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if SSH connection works
echo -e "${BLUE}📡 Testing SSH connection...${NC}"
if ssh $SSH_ALIAS "echo 'SSH connection successful'" > /dev/null 2>&1; then
    print_status "SSH connection to $SERVER_HOST is working"
else
    print_error "Cannot connect to server via SSH"
    print_warning "Make sure you have 'ssh $SSH_ALIAS' configured in ~/.ssh/config"
    print_warning "Or use: ssh $SERVER_USER@$SERVER_HOST"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in the react-frontend directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found!"
    print_warning "Using environment variables from current shell"
fi

# Check for auto-confirm flag
AUTO_CONFIRM=${1:-no}

if [ "$AUTO_CONFIRM" != "--yes" ] && [ "$AUTO_CONFIRM" != "-y" ]; then
    # Confirm deployment
    echo ""
    echo -e "${YELLOW}⚠️  You are about to deploy to PRODUCTION${NC}"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
else
    echo ""
    echo -e "${GREEN}🚀 Auto-confirming deployment (--yes flag provided)${NC}"
fi

# Build the application
echo ""
echo -e "${BLUE}🔨 Building React application for production...${NC}"

# Load production environment variables (filter out comments and empty lines)
if [ -f ".env.production" ]; then
    set -a
    source <(grep -v '^#' .env.production | grep -v '^$' | sed 's/\r$//')
    set +a
fi

npm run build:prod

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_status "Build completed successfully"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    print_error "dist directory not found after build"
    exit 1
fi

# Create deployment directory on server
echo ""
echo -e "${BLUE}📁 Creating deployment directory on server...${NC}"
ssh $SSH_ALIAS "mkdir -p $DEPLOY_PATH"
print_status "Directory created: $DEPLOY_PATH"

# Create backup on server
echo ""
echo -e "${BLUE}💾 Creating backup of current frontend...${NC}"
ssh $SSH_ALIAS << ENDSSH
if [ -d "$DEPLOY_PATH" ] && [ "\$(ls -A $DEPLOY_PATH)" ]; then
    BACKUP_DIR="$DEPLOY_PATH.backup.\$(date +%Y%m%d_%H%M%S)"
    echo "Creating backup: \$BACKUP_DIR"
    cp -r $DEPLOY_PATH \$BACKUP_DIR
    echo "✅ Backup created"
else
    echo "⚠️  No existing frontend to backup"
fi
ENDSSH

# Deploy files to server
echo ""
echo -e "${BLUE}📦 Deploying files to server...${NC}"
rsync -avz --delete \
    --progress \
    dist/ $SSH_ALIAS:$DEPLOY_PATH/

print_status "Files deployed to server"

# Verify deployment
echo ""
echo -e "${BLUE}🔍 Verifying deployment...${NC}"
ssh $SSH_ALIAS << ENDSSH
echo "📊 Deployed files:"
ls -lah $DEPLOY_PATH | head -10
echo ""
echo "📈 Total size:"
du -sh $DEPLOY_PATH
ENDSSH

# Final information
echo ""
echo -e "${GREEN}✅ React Frontend deployed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Information:${NC}"
echo "  Server: $SERVER_HOST"
echo "  Path: $DEPLOY_PATH"
echo "  URL: https://keyprog.varrho.com"
echo ""
echo -e "${BLUE}🔧 Important Notes:${NC}"
echo "  - Make sure your Nginx is configured to serve from: $DEPLOY_PATH"
echo "  - The frontend is a static build (no Node.js server needed)"
echo "  - All API calls go to: \$VITE_DIRECTUS_URL (from .env.production)"
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo "  SSH to server:"
echo "    ssh $SSH_ALIAS"
echo ""
echo "  Check deployed files:"
echo "    ssh $SSH_ALIAS 'ls -la $DEPLOY_PATH'"
echo ""
echo "  Rollback to backup (if needed):"
echo "    ssh $SSH_ALIAS 'ls -d $DEPLOY_PATH.backup.*'"
echo "    ssh $SSH_ALIAS 'rm -rf $DEPLOY_PATH && mv $DEPLOY_PATH.backup.TIMESTAMP $DEPLOY_PATH'"
echo ""
print_status "Deployment complete! 🎉"
