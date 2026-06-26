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

---

## 4. SSH Hardening

To safeguard against unauthorized login attempts, modify the SSH daemon configuration:
`sudo nano /etc/ssh/sshd_config`

Enforce the following parameters:
```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 4
```

Restart the SSH daemon to apply changes:
```bash
sudo systemctl restart ssh
```

---

## 5. Nginx Security Hardening

To harden the Nginx web server against Clickjacking, MIME type sniffing, and request flooding:

### A. HTTP Security Headers
Within `/etc/nginx/sites-available/lt-booking` under the `server` block listening on port 443, configure headers:
```nginx
# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Clickjacking Mitigation
add_header X-Frame-Options "DENY" always;

# MIME Sniffing Mitigation
add_header X-Content-Type-Options "nosniff" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### B. Payload Size Control
To prevent massive file uploads or buffer overflow attempts, restrict request sizes globally in `/etc/nginx/nginx.conf` or inside the server blocks:
```nginx
client_max_body_size 10M;
```

### C. Rate Limiting Setup
Define a request rate zone in `/etc/nginx/nginx.conf` within the `http` context:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

Apply the rate limits inside `/etc/nginx/sites-available/lt-booking` server location blocks:
```nginx
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://localhost:5000/;
    ...
}
```

### D. Gzip Compression
Ensure compression is enabled in `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
gzip_min_length 256;
```

---

## 6. PostgreSQL Local Protection

Ensure that PostgreSQL is configured to block external public access and listen strictly to local requests. 

1. Verify listener configurations in `/etc/postgresql/16/main/postgresql.conf`:
   ```text
   listen_addresses = 'localhost'
   ```
2. Verify local authorization rules in `/etc/postgresql/16/main/pg_hba.conf`:
   ```text
   # Allow local connections only
   local   all             all                                     peer
   host    all             all             127.0.0.1/32            md5
   host    all             all             ::1/128                 md5
   ```
3. Never map PostgreSQL ports (default `5432` / shadow `5433`) in UFW firewall rules.

---

## 7. Host Resilience & Monitoring

### A. Fail2Ban Installation
Install Fail2Ban to automatically ban IP addresses exhibiting brute-force behavior:
```bash
sudo apt install fail2ban -y
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

Create a local jail configuration `sudo nano /etc/fail2ban/jail.local`:
```text
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 1h
```

### B. Automatic OS Security Updates
Ensure `unattended-upgrades` is running to install security updates automatically:
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### C. PM2 Process Resilience
Register the Express backend as a boot-time service using PM2 startup hook:
```bash
pm2 startup
# Run the command generated by the output of "pm2 startup"
pm2 save
```

