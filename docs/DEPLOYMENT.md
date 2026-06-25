# LT-Booking-V3 Production Deployment Guide

This document is the official production deployment handbook for the **LT-Booking-V3** project. It outlines the complete infrastructure setup, configuration matrices, deployment workflows, automated backups, troubleshooting procedures, and system maintenance playbooks.

---

## 1. Project Overview

* **Project Name**: LT-Booking-V3
* **Repository Name**: `Odia-Dev/LT-Booking-V3-Vps-Antigravity`
* **Current Branch**: `develop` (staging/testing) | `main` / `production` (production releases)
* **Technology Stack**:
  * **Frontend**: Next.js 15 (React 19, TypeScript, TailwindCSS/PostCSS v4)
  * **Backend**: Express + Node.js (TypeScript, Zod validation)
  * **Database**: PostgreSQL + Prisma ORM (Object-Relational Mapping client)
  * **Reverse Proxy**: Nginx (serving HTTPS, routing requests, proxy headers configuration)
  * **Process Manager**: PM2 (node process runner, cluster manager)
  * **Hosting**: Hostinger VPS (KVM 2) running Ubuntu 24.04 LTS

---

## 2. Production Server

The production environment is configured on the following base specifications:

* **VPS Provider**: Hostinger VPS
* **Operating System**: Ubuntu 24.04 LTS (64-bit)
* **Node Version**: v20+ (managed via NVM)
* **NPM Version**: v10+
* **PM2 Version**: v5.3+
* **Nginx**: v1.24+
* **PostgreSQL**: v16+
* **Prisma**: v5.12+

---

## 3. Project Directory Structure

All files reside inside the `/var/www/LT-Booking-V3` directory:

```
/var/www/LT-Booking-V3/
├── backend/                   # Node.js/Express API server
│   ├── dist/                  # Compiled JS assets
│   ├── node_modules/          # Backend dependency modules
│   ├── prisma/                # Database schema and migration logs
│   ├── package.json           # Backend dependencies and scripts
│   └── .env                   # API environment configuration
├── frontend/                  # Next.js web application
│   ├── .next/                 # Production web server assets
│   ├── node_modules/          # Frontend dependencies
│   ├── package.json           # Web dependencies and dev tooling
│   └── .env.production        # Next.js env config
├── docs/                      # Technical manuals and design systems
├── ecosystem.config.js        # PM2 process orchestrator
└── deploy.sh                  # Shell script automating pulling, building, and restarting
```

---

## 4. Environment Variables

The application requires environment variables setup for operation. Do not check actual values into source repositories.

### Backend (`backend/.env`)
* `DATABASE_URL`: Connection string (`postgresql://<db_user>:<db_pass>@localhost:5432/<db_name>?schema=public`)
* `JWT_SECRET`: Secret key for cryptographically signing admin session cookies
* `ADMIN_EMAIL`: Email credential for the default Administrator account
* `ADMIN_PASSWORD_HASH`: Pre-hashed bcrypt password for Administrator authentication
* `PORT`: Internal port the backend API runs on (default: `5000`)
* `FRONTEND_URL`: Public domain of the frontend website for CORS policy configuration

### Frontend (`frontend/.env.production`)
* `NEXT_PUBLIC_API_URL`: Public entry point endpoint for API requests (e.g. `https://laxmitoyota.co.in`)
* `PORT`: Internal port the Next.js production server runs on (default: `3000`)

---

## 5. PM2 Process Management

PM2 ensures the Express API and Next.js server are kept alive, restarted on crash, and run in cluster configurations.

### Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [
    {
      name: "lt-booking-backend",
      script: "dist/app.js",
      cwd: "./backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "lt-booking-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "./frontend",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### Essential PM2 Commands:
* **Start applications**: `pm2 start ecosystem.config.js`
* **Zero-downtime reload**: `pm2 reload ecosystem.config.js`
* **Restart processes**: `pm2 restart ecosystem.config.js`
* **Check status**: `pm2 status`
* **View logs**: `pm2 logs`
* **Save current process list**: `pm2 save`
* **Configure PM2 system startup**: `pm2 startup`
* **Real-time terminal monitoring**: `pm2 monit`

---

## 6. Nginx Configuration

Nginx acts as the secure reverse-proxy and routes incoming traffic through port `80` (HTTP) and `443` (HTTPS).

* **Frontend Proxy**: Routes requests targeting root `/` to `http://localhost:3000`
* **Backend API Proxy**: Routes requests targeting `/api/` to `http://localhost:5000`
* **SSL Certificates**: Managed via Let's Encrypt (using automatic renewal validation)
* **HTTP Redirect**: Port 80 queries are immediately redirected using Status `301` to secure HTTPS.

### Example Nginx Server Block
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

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

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
}
```

### Server Management Commands:
* **Validate configuration syntax**: `sudo nginx -t`
* **Reload Nginx server**: `sudo systemctl reload nginx`

---

## 7. Database Configuration

The production database is managed via a local PostgreSQL server and updated with Prisma ORM client mappings.

* **Database Name**: `lt_booking_v3`
* **Database User**: `lt_user`
* **Operations**:
  * **Generate Prisma Client**: `npx prisma generate` (run in `backend`)
  * **Validate Schema**: `npx prisma validate`
  * **Execute Pending Migrations**: `npx prisma migrate deploy`
  * **Seed Data**: `npx prisma db seed` (populates vehicles, colors, variants, and branches)

---

## 8. Automated Database Backup

A secure cron script automates compressed PostgreSQL backups every night.

### Backup Script (`/usr/local/bin/backup_lt_booking.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="lt_booking_v3"
DB_USER="lt_user"
DATE=$(date +%F_%H-%M-%S)
FILENAME="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql.gz"

# Ensure directory exists
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -h localhost -d $DB_NAME | gzip > $FILENAME

# Restrict backup file permissions
chmod 600 $FILENAME

# Keep only the last 14 days of backups
find $BACKUP_DIR -type f -mtime +14 -name "*.sql.gz" -delete
```

### Passwordless Connection Security (`~/.pgpass`)
To run database backups unattended without prompting for passwords:
Create a file named `.pgpass` in the home directory of the backup runner user (e.g. `/root/.pgpass` or `/home/ubuntu/.pgpass`):
`localhost:5432:lt_booking_v3:lt_user:Sktvps#2026!`

Set appropriate file permission limits:
`chmod 600 ~/.pgpass`

### Cron Scheduler Configuration
Execute the backup script daily at 2:00 AM:
`sudo crontab -e`

Add the cron statement:
```cron
0 2 * * * /bin/bash /usr/local/bin/backup_lt_booking.sh >> /var/log/db_backup.log 2>&1
```

---

## 9. Deployment Workflow

Perform these tasks sequentially for each code release:

1. **SSH Connect**: Login to the production VPS.
2. **Execute Deployment**:
   ```bash
   cd /var/www/LT-Booking-V3
   git pull origin main
   ./deploy.sh
   ```

---

## 10. Verification Checklist

Ensure the following are verified after deployment:

- [ ] **Backend Health**: Verify `https://laxmitoyota.co.in/api/health` responds with HTTP `200` and `{"success":true}`.
- [ ] **Frontend Integrity**: Load website and click through vehicle catalog routes.
- [ ] **PM2 Status**: Confirm both target applications run as `online` with stable memory load.
- [ ] **Nginx Services**: Run `sudo systemctl status nginx` and check access logs.
- [ ] **Prisma & DB Status**: Verify queries write successfully without errors.

---

## 11. Troubleshooting

* **Frontend Not Loading**:
  Check if PM2 frontend process has crashed or is listening on wrong port:
  `pm2 status lt-booking-frontend`
* **Backend Not Responding (502 Gateway)**:
  Inspect Express server port binds:
  `sudo lsof -i :5000`
* **Prisma Connection Failures**:
  Check status of system-level PostgreSQL:
  `sudo systemctl status postgresql`
* **PM2 Restart Loops**:
  Read application logs:
  `pm2 logs lt-booking-backend`
* **SSL Certificate Mismatch**:
  Check expiry or validate renewal:
  `sudo certbot certificates`

---

## 12. Rollback Strategy

If a deployment fails, run rollback commands:

1. **Revert Git Commit**:
   ```bash
   git checkout <previous_stable_commit_hash>
   ```
2. **Re-build Assets**:
   ```bash
   cd backend && npm run build && cd ../frontend && npm run build && cd ..
   ```
3. **Reload processes**:
   ```bash
   pm2 reload ecosystem.config.js
   ```
4. **Restore Database (If Schema Migration is Irreversible)**:
   ```bash
   gunzip -c /var/backups/postgresql/lt_booking_v3_backup_<date>.sql.gz | psql -U lt_user -h localhost -d lt_booking_v3
   ```

---

## 13. Production Readiness Checklist

* **Infrastructure**:
  * [x] Nginx configurations operational
  * [x] Let's Encrypt certificates configured
* **Database**:
  * [x] Database migrations up to date
  * [x] Automated nightly backup cron registered
* **Authentication**:
  * [x] JWT verification middleware active
* **SEO**:
  * [x] Metadata configurations verified
* **Modules Status**:
  * [x] M01-M03 Base project foundations & Auth Setup
  * [x] M04 Admin Dashboard
  * [x] M05-M07 Vehicle, Variant & Color CMS
  * [ ] M08 Branch Management (Pending Deploy verification)
  * [ ] M09 Payment Gateway (Pending)
  * [ ] M10 Lead CRM (Pending)
  * [ ] M11 Booking Module (Pending)

---

## 14. Automated Deployment Script

An automated deployment script is located at the project root: `deploy.sh`.

### Usage
Execute the script from the project root:
```bash
./deploy.sh
```

The script automates:
1. Directory structure validation checks.
2. Git fetch and pulls from branch `develop`.
3. Backend dependencies installation, Prisma client generation, validations, schema migrations, and production compilation.
4. Frontend clean dependencies installs and Next.js builds.
5. PM2 reloads.
6. Post-deployment port-listening and health check diagnostics verification.

---

## 15. Useful Commands Reference

### Git
```bash
git log -n 5
git status
git diff
```

### PM2
```bash
pm2 status
pm2 logs
pm2 reload all
```

### Prisma
```bash
npx prisma migrate status
npx prisma db push --preview-feature
```

### Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo nginx -t
```

### PostgreSQL
```bash
sudo -i -u postgres psql
\l
\c lt_booking_v3
```
