# Docker Deployment Guide - React Frontend

## 🐳 Overview

This guide covers deploying the React frontend as a Docker container instead of static files.

### **Benefits of Docker Deployment:**
- ✅ Consistent environment across dev/staging/production
- ✅ Easy rollback (just switch image tags)
- ✅ Isolated from host system
- ✅ Built-in health checks
- ✅ Easy scaling and orchestration

---

## 🚀 Quick Start

### **Option 1: Automated Docker Deployment**
```bash
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### **Option 2: Manual Docker Deployment**
```bash
# Build image
docker build -t keyprog-frontend:latest .

# Save and transfer
docker save keyprog-frontend:latest | gzip | ssh digitalocean 'docker load'

# Deploy on server
ssh digitalocean 'docker run -d --name keyprog-frontend -p 3000:80 --restart unless-stopped keyprog-frontend:latest'
```

### **Option 3: Docker Compose (Recommended for Production)**
```bash
# On server
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📦 Docker Image Structure

### **Multi-Stage Build**

**Stage 1: Build** (node:23-alpine)
- Installs Bun
- Installs dependencies
- Builds React app
- Output: `/app/dist`

**Stage 2: Serve** (nginx:stable-alpine)
- Copies built files from Stage 1
- Configures Nginx
- Exposes port 80
- Final image size: ~50MB

### **Dockerfile Breakdown**
```dockerfile
# Stage 1: Build
FROM node:23-alpine AS build
WORKDIR /app
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🛠️ Deployment Methods

### **Method 1: Automated Script (`deploy-docker.sh`)**

**Features:**
- ✅ Builds image locally
- ✅ Transfers to server
- ✅ Stops old container
- ✅ Starts new container
- ✅ Cleans up old images
- ✅ Verification

**Usage:**
```bash
# Interactive mode
./deploy-docker.sh

# Auto-confirm mode
./deploy-docker.sh --yes
```

**What it does:**
1. Tests SSH connection
2. Checks Docker on server
3. Builds image locally
4. Saves image to tar.gz
5. Transfers to server via rsync
6. Loads image on server
7. Stops old container
8. Starts new container
9. Verifies deployment

---

### **Method 2: Docker Compose**

**Local Development:**
```bash
docker-compose up -d
```

**Production Deployment:**
```bash
# Copy compose file to server
scp docker-compose.prod.yml digitalocean:/home/keyprog/

# Deploy on server
ssh digitalocean 'cd /home/keyprog && docker-compose -f docker-compose.prod.yml up -d'
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  react-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### **Method 3: Docker Registry (Advanced)**

**1. Push to Docker Hub:**
```bash
# Build and tag
docker build -t yourusername/keyprog-frontend:latest .

# Push to Docker Hub
docker push yourusername/keyprog-frontend:latest

# Pull and run on server
ssh digitalocean 'docker pull yourusername/keyprog-frontend:latest && docker run -d --name keyprog-frontend -p 3000:80 --restart unless-stopped yourusername/keyprog-frontend:latest'
```

**2. Use GitHub Container Registry:**
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and tag
docker build -t ghcr.io/staminna/keyprog-frontend:latest .

# Push
docker push ghcr.io/staminna/keyprog-frontend:latest

# Pull on server
ssh digitalocean 'docker pull ghcr.io/staminna/keyprog-frontend:latest'
```

---

## 🔧 Configuration

### **Environment Variables**

Build-time variables (in Dockerfile):
```dockerfile
ARG VITE_DIRECTUS_URL=https://api.varrho.com
ARG VITE_API_URL=https://api.varrho.com
ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_API_URL=$VITE_API_URL
```

Runtime variables (in docker-compose):
```yaml
environment:
  - NODE_ENV=production
  - VITE_DIRECTUS_URL=https://api.varrho.com
```

### **Port Mapping**

- **Container Port:** 80 (Nginx inside container)
- **Host Port:** 3000 (Exposed on server)
- **Public Access:** Via Nginx reverse proxy

**Nginx Reverse Proxy Config:**
```nginx
server {
    listen 80;
    server_name keyprog.varrho.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Container Management

### **View Running Containers**
```bash
ssh digitalocean 'docker ps'
```

### **View Container Logs**
```bash
# Follow logs
ssh digitalocean 'docker logs -f keyprog-frontend'

# Last 100 lines
ssh digitalocean 'docker logs --tail 100 keyprog-frontend'

# Since timestamp
ssh digitalocean 'docker logs --since 2025-10-21T15:00:00 keyprog-frontend'
```

### **Container Stats**
```bash
ssh digitalocean 'docker stats keyprog-frontend'
```

### **Restart Container**
```bash
ssh digitalocean 'docker restart keyprog-frontend'
```

### **Stop Container**
```bash
ssh digitalocean 'docker stop keyprog-frontend'
```

### **Remove Container**
```bash
ssh digitalocean 'docker stop keyprog-frontend && docker rm keyprog-frontend'
```

### **Access Container Shell**
```bash
ssh digitalocean 'docker exec -it keyprog-frontend sh'
```

### **Inspect Container**
```bash
ssh digitalocean 'docker inspect keyprog-frontend'
```

---

## 🔄 Updates & Rollbacks

### **Update to New Version**
```bash
# Build new image with tag
docker build -t keyprog-frontend:v2.0.0 .

# Deploy new version
./deploy-docker.sh
```

### **Rollback to Previous Version**
```bash
# Stop current container
ssh digitalocean 'docker stop keyprog-frontend && docker rm keyprog-frontend'

# Start previous version
ssh digitalocean 'docker run -d --name keyprog-frontend -p 3000:80 --restart unless-stopped keyprog-frontend:v1.0.0'
```

### **Zero-Downtime Deployment**
```bash
# Start new container on different port
ssh digitalocean 'docker run -d --name keyprog-frontend-new -p 3001:80 keyprog-frontend:latest'

# Test new container
curl http://keyprog.varrho.com:3001

# Update Nginx to point to new port
# Stop old container
ssh digitalocean 'docker stop keyprog-frontend && docker rm keyprog-frontend'

# Rename new container
ssh digitalocean 'docker rename keyprog-frontend-new keyprog-frontend'
```

---

## 🔍 Troubleshooting

### **Problem: Container Won't Start**
```bash
# Check logs
ssh digitalocean 'docker logs keyprog-frontend'

# Check if port is in use
ssh digitalocean 'netstat -tulpn | grep 3000'

# Check Docker daemon
ssh digitalocean 'systemctl status docker'
```

### **Problem: Image Build Fails**
```bash
# Clean Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t keyprog-frontend:latest .

# Check Dockerfile syntax
docker build --check .
```

### **Problem: Container Crashes**
```bash
# View crash logs
ssh digitalocean 'docker logs keyprog-frontend'

# Check health status
ssh digitalocean 'docker inspect --format="{{.State.Health.Status}}" keyprog-frontend'

# Restart with more verbose logging
ssh digitalocean 'docker run -d --name keyprog-frontend -p 3000:80 --log-level debug keyprog-frontend:latest'
```

### **Problem: High Memory Usage**
```bash
# Check container stats
ssh digitalocean 'docker stats keyprog-frontend --no-stream'

# Set memory limits
ssh digitalocean 'docker run -d --name keyprog-frontend -p 3000:80 --memory="512m" --memory-swap="1g" keyprog-frontend:latest'
```

---

## 🛡️ Security Best Practices

### **1. Non-Root User**
Add to Dockerfile:
```dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

### **2. Read-Only Filesystem**
```bash
docker run -d --name keyprog-frontend -p 3000:80 --read-only --tmpfs /tmp keyprog-frontend:latest
```

### **3. Security Scanning**
```bash
# Scan image for vulnerabilities
docker scan keyprog-frontend:latest

# Use Trivy
trivy image keyprog-frontend:latest
```

### **4. Minimal Base Image**
Already using `nginx:stable-alpine` (smallest Nginx image)

### **5. No Secrets in Image**
- Never COPY .env files
- Use environment variables
- Use Docker secrets for sensitive data

---

## 📈 Monitoring & Health Checks

### **Built-in Health Check**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### **Check Health Status**
```bash
ssh digitalocean 'docker inspect --format="{{.State.Health.Status}}" keyprog-frontend'
```

### **Prometheus Metrics** (Optional)
Add nginx-prometheus-exporter sidecar:
```yaml
services:
  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    ports:
      - "9113:9113"
    command:
      - -nginx.scrape-uri=http://react-frontend:80/stub_status
```

---

## 🚀 CI/CD Integration

### **GitHub Actions Workflow**

Update `.github/workflows/deploy-production.yml`:
```yaml
- name: Build Docker Image
  run: docker build -t keyprog-frontend:${{ github.sha }} .

- name: Save Docker Image
  run: docker save keyprog-frontend:${{ github.sha }} | gzip > image.tar.gz

- name: Transfer Image
  run: rsync -avz image.tar.gz ${{ env.SERVER_USER }}@${{ env.SERVER_HOST }}:/tmp/

- name: Deploy Container
  run: |
    ssh ${{ env.SERVER_USER }}@${{ env.SERVER_HOST }} << 'EOF'
      docker load < /tmp/image.tar.gz
      docker stop keyprog-frontend || true
      docker rm keyprog-frontend || true
      docker run -d --name keyprog-frontend -p 3000:80 --restart unless-stopped keyprog-frontend:${{ github.sha }}
    EOF
```

---

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **Docker Compose:** https://docs.docker.com/compose/
- **Nginx Docker:** https://hub.docker.com/_/nginx
- **Multi-Stage Builds:** https://docs.docker.com/build/building/multi-stage/

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Docker installed on server
- [ ] Nginx reverse proxy configured
- [ ] Firewall allows port 3000
- [ ] Environment variables set
- [ ] Health check working

After deploying:
- [ ] Container running (`docker ps`)
- [ ] Health check passing
- [ ] Website accessible
- [ ] Logs show no errors
- [ ] Resource usage normal

---

## 🎯 Quick Reference

**Build:**
```bash
docker build -t keyprog-frontend:latest .
```

**Run Locally:**
```bash
docker run -p 3000:80 keyprog-frontend:latest
```

**Deploy to Server:**
```bash
./deploy-docker.sh
```

**View Logs:**
```bash
ssh digitalocean 'docker logs -f keyprog-frontend'
```

**Restart:**
```bash
ssh digitalocean 'docker restart keyprog-frontend'
```

🎉 Happy Docker deploying!
