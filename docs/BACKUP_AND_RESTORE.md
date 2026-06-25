# Database Backup & Recovery Plan

This document details the scheduling, script setup, and recovery executions to safeguard the production PostgreSQL database.

---

## 1. Automated Daily Backups

We run a lightweight cron shell script that exports compressed PostgreSQL data files to `/var/backups/db/`.

### Backup Script (`/var/www/LT-Booking-V3/scripts/backup.sh`)
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/db"
DB_NAME="lt_booking_v3"
DB_USER="lt_user"
DATE=$(date +%F_%H-%M-%S)
FILENAME="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql.gz"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Run dump and compress
pg_dump -U $DB_USER -h localhost -d $DB_NAME | gzip > $FILENAME

# Keep only the last 30 days of backups to save disk space
find $BACKUP_DIR -type f -mtime +30 -name "*.sql.gz" -delete

echo "Backup generated: $FILENAME"
```

### Cron Schedule configuration
Register the job to execute daily at midnight:
`sudo crontab -e`

Add the line:
```cron
0 0 * * * /bin/bash /var/www/LT-Booking-V3/scripts/backup.sh >> /var/log/db_backup.log 2>&1
```

---

## 2. Disaster Recovery Procedure

If a database corruption or loss event occurs, execute these steps:

1. **Clear existing active connections** to avoid blockages:
   ```bash
   sudo systemctl stop lt-booking-backend
   ```
2. **Re-create clean database tables**:
   ```bash
   psql -U postgres -h localhost -c "DROP DATABASE lt_booking_v3;"
   psql -U postgres -h localhost -c "CREATE DATABASE lt_booking_v3;"
   psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE lt_booking_v3 TO lt_user;"
   ```
3. **Execute database restore**:
   Navigate to the latest backup file:
   ```bash
   gunzip -c /var/backups/db/lt_booking_v3_backup_2026-06-25_00-00-00.sql.gz | psql -U lt_user -h localhost -d lt_booking_v3
   ```
4. **Restart applications**:
   ```bash
   pm2 start lt-booking-backend
   ```
