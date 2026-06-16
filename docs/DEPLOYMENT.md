# Deployment Guide: Hostinger VPS Setup

This document outlines the deployment configuration, commands, and rules for running Laxmi Toyota Platform V3 on a Hostinger KVM 2 VPS running Ubuntu 24.04.

---

## 1. Environment Preparation

Before starting deployment, confirm the VPS has the following installed:
* Node.js (v20+ recommended)
* NPM (v10+)
* PM2 (Process Manager)
* PostgreSQL Database Server
* Nginx (Web Server / Reverse Proxy)

---

## 2. Nginx Configuration

Nginx acts as the reverse proxy, terminating SSL certificates and forwarding traffic to the PM2/Node process.

### Configuration Path
`/etc/nginx/sites-available/laxmitoyota`

### Nginx Server Block Example
```nginx
server {
    listen 80;
    server_name laxmitoyota.co.in www.laxmitoyota.co.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name laxmitoyota.co.in www.laxmitoyota.co.in;

    ssl_certificate /etc/letsencrypt/live/laxmitoyota.co.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/laxmitoyota.co.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

---

## 3. PM2 Process Management

PM2 is used to run, monitor, and daemonize the Next.js production build.

### PM2 Configuration File (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: "laxmi-toyota-v3",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

---

## 4. Manual Deployment Runbook

Deployments are triggered manually from local builds or pull requests to main.

1. SSH into the VPS.
2. Navigate to the project root directory:
   ```bash
   cd /var/www/laxmi-toyota-v3
   ```
3. Fetch the latest changes from the GitHub repository:
   ```bash
   git pull origin main
   ```
4. Install dependencies:
   ```bash
   npm ci --omit=dev
   ```
5. Apply database migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Build the application locally (or run build on VPS if resources permit):
   ```bash
   npm run build
   ```
7. Restart the PM2 process:
   ```bash
   pm2 restart ecosystem.config.js --update-env
   ```
