#!/bin/bash

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_migration_needed() {
    local tables_exist=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'provider');" | grep -q 't' && echo "true" || echo "false")
    
    if [ "$tables_exist" = "false" ]; then
        echo "true"
        return
    fi
    
    local db_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM provider;" | tr -d '[:space:]')
    local expected_count=$(ls -l /app/providers | grep -c '^d')
    
    if [ "$db_count" -ne "$expected_count" ]; then
        echo "true"
    else
        echo "false"
    fi
}

do_migration() {
    log "Performing database migration..."
    
    psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    log "Initializing database tables..."
    python scripts/init_db.py
    
    log "Migrating provider data..."
    python scripts/migrate_providers.py
    
    log "Verifying migration..."
    python scripts/verify_db.py
}

log "Starting initialization process..."

log "Verifying providers directory structure:"
if [ -d "/app/providers" ]; then
    PROVIDER_COUNT=$(ls -l /app/providers | grep -c '^d')
    log "Found $PROVIDER_COUNT provider directories"
else
    log "Error: /app/providers directory not found"
    exit 1
fi

log "Verifying database connection..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"; do
    log "Database is not ready - waiting..."
    sleep 2
done
log "Database connection successful"

psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS migration_lock;"

log "Setting up migration lock..."
psql "$DATABASE_URL" -c "CREATE TABLE IF NOT EXISTS migration_lock (locked boolean PRIMARY KEY DEFAULT true, created_at timestamp DEFAULT CURRENT_TIMESTAMP, pod_name text);"

if [ "$(check_migration_needed)" = "true" ]; then
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

GUNICORN_WORKERS=${GUNICORN_WORKERS:-4}
GUNICORN_THREADS=${GUNICORN_THREADS:-4}
GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-300}
GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5}
BIND_ADDRESS="0.0.0.0:5000"

log "Starting Gunicorn with configuration:"
log "- Workers: $GUNICORN_WORKERS"
log "- Threads: $GUNICORN_THREADS"
log "- Timeout: $GUNICORN_TIMEOUT"
log "- Keep-alive: $GUNICORN_KEEPALIVE"
log "- Bind address: $BIND_ADDRESS"

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