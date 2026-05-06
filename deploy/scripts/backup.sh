#!/bin/bash

# ============================================
# Million Platform - Database Backup Script
# Add to crontab: 0 2 * * * /var/www/million-platform/deploy/scripts/backup.sh
# ============================================

set -e

# Configuration
BACKUP_DIR="/var/www/million-platform/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "📦 Backing up database..."
docker exec million_postgres pg_dump -U million_user million_db > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads (if not using cloud storage)
if [ -d "/var/www/million-platform/uploads" ]; then
    echo "📁 Backing up uploads..."
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /var/www/million-platform uploads
fi

# Remove old backups
echo "🗑️ Removing backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Backup complete: $BACKUP_DIR/db_backup_$DATE.sql.gz"
