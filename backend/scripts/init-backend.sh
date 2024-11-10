#!/bin/bash

# Exit on error
set -e

# Function to log messages with timestamps
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if tables exist and have correct data
check_migration_needed() {
    # Check if tables exist
    local tables_exist=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider');" | grep -q 't' && echo "true" || echo "false")
    
    if [ "$tables_exist" = "false" ]; then
        echo "true"
        return
    fi
    
    # Count providers in database
    local db_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM provider;" | tr -d '[:space:]')
    local expected_count=$(ls -l /app/providers | grep -c '^d')
    
    if [ "$db_count" -ne "$expected_count" ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Function to perform migration
do_migration() {
    log "Performing database migration..."
    
    # Drop schema and recreate it
    psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    # Initialize database
    log "Initializing database tables..."
    python scripts/init_db.py
    
    # Migrate providers
    log "Migrating provider data..."
    python scripts/migrate_providers.py
    
    # Verify migration
    log "Verifying migration..."
    python scripts/verify_db.py
}

# Start initialization process
log "Starting initialization process..."

# Verify providers directory structure
log "Verifying providers directory structure:"
if [ -d "/app/providers" ]; then
    PROVIDER_COUNT=$(ls -l /app/providers | grep -c '^d')
    log "Found $PROVIDER_COUNT provider directories"
else
    log "Error: /app/providers directory not found"
    exit 1
fi

# Wait for database
log "Verifying database connection..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"; do
    log "Database is not ready - waiting..."
    sleep 2
done
log "Database connection successful"

# Clean up any existing locks
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS migration_lock;"

# Create lock table
log "Setting up migration lock..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS migration_lock (locked boolean PRIMARY KEY DEFAULT true, created_at timestamp DEFAULT CURRENT_TIMESTAMP, pod_name text);"

# Check if migration is needed
if [ "$(check_migration_needed)" = "true" ]; then
    # Try to acquire lock
    if psql "$DATABASE_URL" -c "INSERT INTO migration_lock (pod_name) VALUES ('$(hostname)') ON CONFLICT DO NOTHING RETURNING locked;" | grep -q 't'; then
        log "Acquired migration lock, starting migration..."
        do_migration
        log "Migration completed successfully"
        psql "$DATABASE_URL" -c "DROP TABLE migration_lock;"
    else
        log "Another pod is handling migration, waiting..."
        until [ "$(check_migration_needed)" = "false" ]; do
            log "Waiting for migration to complete..."
            sleep 5
        done
        log "Migration completed by another pod"
    fi
else
    log "Database is already properly migrated, skipping"
fi

# Configure Gunicorn
GUNICORN_WORKERS=${GUNICORN_WORKERS:-4}
GUNICORN_THREADS=${GUNICORN_THREADS:-4}
GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-300}
GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5}
BIND_ADDRESS="0.0.0.0:5000"

# Log Gunicorn configuration
log "Starting Gunicorn with configuration:"
log "- Workers: $GUNICORN_WORKERS"
log "- Threads: $GUNICORN_THREADS"
log "- Timeout: $GUNICORN_TIMEOUT"
log "- Keep-alive: $GUNICORN_KEEPALIVE"
log "- Bind address: $BIND_ADDRESS"

# Start Gunicorn
exec gunicorn \
    --workers $GUNICORN_WORKERS \
    --threads $GUNICORN_THREADS \
    --timeout $GUNICORN_TIMEOUT \
    --keep-alive $GUNICORN_KEEPALIVE \
    --bind $BIND_ADDRESS \
    --log-level info \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance \
    --worker-class=gthread \
    --worker-tmp-dir=/dev/shm \
    'app:app'