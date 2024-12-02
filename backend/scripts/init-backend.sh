#!/bin/bash

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

check_migration_needed() {
    if [ "$SKIP_DB_MIGRATION" = "true" ]; then
        echo "false"
        return
    fi

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
    
    if [ -n "$FORCE_DB_MIGRATION" ] && [ "$FORCE_DB_MIGRATION" = "true" ]; then
        log "Force migration flag is set - migration needed"
        echo "true"
        return
    fi

    echo "false"
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

# Optional: Download providers from S3 if needed
if [ "$SKIP_DB_MIGRATION" != "true" ] && [ -n "$S3_PROVIDERS_URI" ]; then
    log "Downloading providers data from S3..."
    aws s3 cp "$S3_PROVIDERS_URI" /tmp/providers.tar.gz
    tar -xzf /tmp/providers.tar.gz -C /app
    rm /tmp/providers.tar.gz
fi

# Verify database connection
log "Verifying database connection..."
if ! verify_db_connection; then
    log "Failed to establish database connection"
    exit 1
fi
log "Database connection successful"

# Check and perform migration if needed
if [ "$(check_migration_needed)" = "true" ]; then
    log "Running database migration..."
    if [ -d "/app/providers" ]; then
        python scripts/init_db.py && \
        python scripts/migrate_providers.py && \
        python scripts/verify_db.py
    else
        log "Warning: Providers directory not found, skipping migration"
    fi
else
    log "Skipping database migration - database is up to date or migration is disabled"
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