# Keyprog React Frontend - Production Deployment Guide

## 🚀 Quick Deployment

### On Production Server

1. **Pull latest changes:**
   ```bash
   cd /home/keyprog/react-frontend
   git pull origin main
   ```

2. **Deploy using the script:**
   ```bash
   ./deploy.sh
   ```

   Or manually:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify deployment:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   curl -I http://localhost:3000
   ```

## 📋 What's Fixed

✅ **Production Environment Detection**: App now properly detects production and uses HTTPS URLs  
✅ **Docker Security**: Removed unsafe `--host "0.0.0.0"` from development server  
✅ **Multi-stage Build**: Optimized Docker build with Node 23 Alpine + Nginx  
✅ **Nginx Configuration**: Added catch-all routes for Directus API endpoints  
✅ **Mixed Content Errors**: Fixed HTTPS/HTTP protocol issues  

## 🔧 Architecture

- **Build Stage**: Node 23 Alpine with Bun for fast builds
- **Runtime Stage**: Nginx stable-alpine serving static files
- **Port Mapping**: Container port 80 → Host port 3000
- **Proxy Setup**: Main Nginx server proxies to this container

## 🌐 URLs

- **Development**: `http://localhost:3000` (Docker container)
- **Production**: `https://keyprog.varrho.com` (via main Nginx proxy)

## 🐛 Debugging

### Check container logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Check environment detection:
Visit `/debug` route to see environment variables and URL configuration.

### Health check:
```bash
docker-compose -f docker-compose.prod.yml ps
```

## 📝 Environment Variables

Production environment uses `.env.production`:
```
VITE_DIRECTUS_URL=https://keyprog.varrho.com
VITE_DIRECTUS_EMAIL=stamina.nunes@gmail.com
VITE_DIRECTUS_PASSWORD=Nov3abril
VITE_DIRECTUS_TOKEN=UliCO8_WaQe86yzvdj0LP-xzY6NmjdL1
```

## 🔒 Security Notes

- Container runs as root (standard for Nginx containers)
- Security provided by network isolation and main Nginx proxy
- No direct internet exposure - only accessible via main server proxy
- Static files only - no server-side code execution
