#!/bin/bash

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_migration_needed() {
    # First check if provider table exists AND has data
    local tables_exist=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'provider'
    ) AND EXISTS (
        SELECT 1 
        FROM provider LIMIT 1
    );" 2>/dev/null | grep -q 't' && echo "true" || echo "false")
    
    if [ "$tables_exist" = "false" ]; then
        log "Provider table doesn't exist or is empty - migration needed"
        echo "true"
        return
    fi
    
    # Compare provider counts more accurately
    local db_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM provider;" | tr -d '[:space:]')
    local file_count=$(find /app/providers -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d '[:space:]')
    
    log "Database provider count: $db_count"
    log "File system provider count: $file_count"
    
    if [ "$db_count" -ne "$file_count" ]; then
        log "Provider count mismatch - migration needed"
        echo "true"
    else
        echo "false"
    fi
}

check_migration_lock() {
    local has_lock=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'migration_lock'
    );" 2>/dev/null)
    echo $has_lock | tr -d '[:space:]'
}

verify_db_connection() {
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            log "Database connection verified"
            return 0
        fi
        log "Attempt $attempt/$max_attempts: Waiting for database connection..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log "Failed to connect to database after $max_attempts attempts"
    return 1
}

acquire_migration_lock() {
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if psql "$DATABASE_URL" -c "
            INSERT INTO migration_lock (pod_name) 
            VALUES ('$(hostname)') 
            ON CONFLICT (locked) DO UPDATE 
            SET pod_name = '$(hostname)',
                created_at = CURRENT_TIMESTAMP 
            WHERE migration_lock.created_at < NOW() - INTERVAL '5 minutes'
            RETURNING locked;" 2>/dev/null | grep -q 't'; then
            log "Successfully acquired migration lock"
            return 0
        fi
        
        log "Migration attempt $attempt/$max_attempts failed to acquire lock"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log "Failed to acquire migration lock after $max_attempts attempts"
    return 1
}

do_migration() {
    log "Starting database migration process..."
    
    # Create a backup of current schema (if exists)
    if psql "$DATABASE_URL" -c "\dt" 2>/dev/null | grep -q "provider"; then
        log "Creating backup of current schema..."
        pg_dump "$DATABASE_URL" --schema-only > /tmp/schema_backup.sql 2>/dev/null || true
    fi
    
    log "Dropping current schema..."
    if ! psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null; then
        log "Error dropping schema - attempting to proceed anyway"
    fi
    
    log "Initializing database tables..."
    if ! python scripts/init_db.py; then
        log "Error initializing database - attempting to restore from backup"
        if [ -f "/tmp/schema_backup.sql" ]; then
            psql "$DATABASE_URL" -f /tmp/schema_backup.sql
        fi
        return 1
    fi
    
    log "Migrating provider data..."
    if ! python scripts/migrate_providers.py; then
        log "Error during provider migration"
        return 1
    fi
    
    log "Verifying migration..."
    if ! python scripts/verify_db.py; then
        log "Migration verification failed"
        return 1
    fi
    
    log "Migration completed successfully"
    return 0
}

wait_for_migration() {
    local max_wait=300  # 5 minutes
    local waited=0
    
    while [ $waited -lt $max_wait ]; do
        if [ "$(check_migration_needed)" = "false" ]; then
            log "Migration completed by another pod"
            return 0
        fi
        
        if [ "$(check_migration_lock)" = "f" ]; then
            log "No active migration lock found"
            return 0
        fi
        
        log "Waiting for migration to complete... ($waited seconds)"
        sleep 5
        waited=$((waited + 5))
    done
    
    log "Timeout waiting for migration"
    return 1
}

setup_gunicorn() {
    GUNICORN_WORKERS=${GUNICORN_WORKERS:-4}
    GUNICORN_THREADS=${GUNICORN_THREADS:-4}
    GUNICORN_TIMEOUT=${GUNICORN_TIMEOUT:-300}
    GUNICORN_KEEPALIVE=${GUNICORN_KEEPALIVE:-5}
    BIND_ADDRESS="0.0.0.0:5000"
    
    log "Configuring Gunicorn:"
    log "- Workers: $GUNICORN_WORKERS"
    log "- Threads: $GUNICORN_THREADS"
    log "- Timeout: $GUNICORN_TIMEOUT"
    log "- Keep-alive: $GUNICORN_KEEPALIVE"
    log "- Bind address: $BIND_ADDRESS"
}

# Main execution flow
log "Starting initialization process..."

# Verify providers directory
log "Verifying providers directory structure:"
if [ ! -d "/app/providers" ]; then
    log "Error: /app/providers directory not found"
    exit 1
fi

PROVIDER_COUNT=$(find /app/providers -mindepth 1 -maxdepth 1 -type d | wc -l)
log "Found $PROVIDER_COUNT provider directories"

# Verify database connection
log "Verifying database connection..."
if ! verify_db_connection; then
    log "Failed to establish database connection"
    exit 1
fi
log "Database connection successful"

# Check and perform migration if needed
if [ "$(check_migration_needed)" = "true" ]; then
    log "Migration needed - setting up migration lock..."
    
    # Create migration lock table
    psql "$DATABASE_URL" -c "
        CREATE TABLE IF NOT EXISTS migration_lock (
            locked boolean PRIMARY KEY DEFAULT true,
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            pod_name text
        );" 2>/dev/null
    
    if acquire_migration_lock; then
        if do_migration; then
            log "Migration successful - removing lock"
            psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS migration_lock;" 2>/dev/null
        else
            log "Migration failed"
            exit 1
        fi
    else
        log "Another pod is handling migration - waiting..."
        if ! wait_for_migration; then
            log "Migration wait timeout - proceeding anyway"
        fi
    fi
else
    log "No migration needed - database is up to date"
fi

# Setup and start Gunicorn
setup_gunicorn

log "Starting Gunicorn server..."
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