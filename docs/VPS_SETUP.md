# Hostinger VPS Initial Setup Manual

This document details the configuration requirements to prepare a new Hostinger KVM 2 Ubuntu 24.04 VPS server for running the LT-Booking-V3 platform.

---

## 1. Initial Access & User Management

1. **SSH Connection**: Access the server via terminal:
   ```bash
   ssh root@194.164.149.117
   ```
2. **System Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. **Firewall Protection (UFW)**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

---

## 2. Package Installation

Install Node.js (via NVM), PostgreSQL, Nginx, Git, and Certbot for SSL management:

### NVM & Node.js
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### PM2 Process Manager
```bash
npm install -g pm2
```

### PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Configure a database and user:
```bash
sudo -i -u postgres psql
# CREATE DATABASE lt_booking_v3;
# CREATE USER lt_user WITH PASSWORD 'secure_password';
# GRANT ALL PRIVILEGES ON DATABASE lt_booking_v3 TO lt_user;
# \q
```

### Nginx & SSL Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 3. Reverse Proxy Configuration

Create the site configuration file:
`sudo nano /etc/nginx/sites-available/lt-booking`

Link the file to active configurations:
```bash
sudo ln -s /etc/nginx/sites-available/lt-booking /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Request a secure Let's Encrypt certificate:
```bash
sudo certbot --nginx -d laxmitoyota.co.in -d www.laxmitoyota.co.in
```
