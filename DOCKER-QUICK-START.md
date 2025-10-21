# Docker Deployment - Quick Start Guide

## 🚀 Deploy in 3 Steps

### **Step 1: Make script executable**
```bash
chmod +x deploy-docker.sh
```

### **Step 2: Deploy to production**
```bash
./deploy-docker.sh
```

### **Step 3: Verify**
```bash
curl http://keyprog.varrho.com:3000
```

That's it! 🎉

---

## 📋 Using Makefile (Easier)

### **Build and deploy:**
```bash
make prod-deploy
```

### **View all commands:**
```bash
make help
```

### **Common commands:**
```bash
make build          # Build Docker image
make run            # Run locally
make logs           # View logs
make stop           # Stop container
make deploy         # Deploy to server
```

---

## 🔧 What Gets Deployed

**Container Details:**
- **Image:** keyprog-frontend:latest
- **Base:** Nginx Alpine (50MB)
- **Port:** 3000 (on server)
- **Auto-restart:** Yes
- **Health checks:** Enabled

**What's inside:**
- Built React app (static files)
- Nginx web server
- Custom Nginx config
- Health check endpoint

---

## 🌐 Access Your App

**After deployment:**
- **Direct:** http://keyprog.varrho.com:3000
- **Via Nginx:** https://keyprog.varrho.com (if reverse proxy configured)

---

## 📊 Monitoring

### **View logs:**
```bash
ssh digitalocean 'docker logs -f keyprog-frontend'
```

### **Check status:**
```bash
ssh digitalocean 'docker ps | grep keyprog-frontend'
```

### **Container stats:**
```bash
ssh digitalocean 'docker stats keyprog-frontend --no-stream'
```

---

## 🔄 Updates

### **Deploy new version:**
```bash
# Make your changes
git commit -am "Update frontend"

# Deploy
./deploy-docker.sh
```

### **Rollback:**
```bash
# Stop current
ssh digitalocean 'docker stop keyprog-frontend && docker rm keyprog-frontend'

# Start previous version (if tagged)
ssh digitalocean 'docker run -d --name keyprog-frontend -p 3000:80 keyprog-frontend:previous'
```

---

## 🛠️ Troubleshooting

### **Container won't start:**
```bash
ssh digitalocean 'docker logs keyprog-frontend'
```

### **Port already in use:**
```bash
ssh digitalocean 'netstat -tulpn | grep 3000'
```

### **Rebuild from scratch:**
```bash
make clean
make build
```

---

## 📚 More Info

- **Full guide:** See `DOCKER-DEPLOYMENT.md`
- **Deployment options:** See `DEPLOYMENT.md`
- **Makefile commands:** Run `make help`

---

## ✅ Checklist

Before first deployment:
- [ ] Docker installed on server: `ssh digitalocean 'docker --version'`
- [ ] Port 3000 open in firewall
- [ ] SSH access working: `ssh digitalocean 'echo OK'`

After deployment:
- [ ] Container running: `ssh digitalocean 'docker ps'`
- [ ] App accessible: `curl http://keyprog.varrho.com:3000`
- [ ] No errors in logs: `ssh digitalocean 'docker logs keyprog-frontend'`

🎉 You're all set!
