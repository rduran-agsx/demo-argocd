#!/bin/bash
echo "Waiting for database..."
while ! pg_isready -h hiraya-database -U $DB_USER; do
    sleep 2
done
echo "Database is ready!"

# Try to acquire lock for migration
psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS migration_lock (locked boolean PRIMARY KEY DEFAULT true);"
if psql $DATABASE_URL -c "INSERT INTO migration_lock DEFAULT VALUES ON CONFLICT DO NOTHING RETURNING locked;" | grep -q 't'; then
    echo "Acquired migration lock, performing migration..."
    python scripts/init_db.py
    python scripts/migrate_providers.py
    python scripts/verify_db.py
    psql $DATABASE_URL -c "DROP TABLE migration_lock;"
else
    echo "Another pod is handling migration, waiting..."
    while ! psql $DATABASE_URL -c "SELECT 1 FROM pg_tables WHERE tablename = 'provider'" | grep -q '1'; do
        sleep 5
    done
fi

# Start Flask app
flask run --host=0.0.0.0 --port=5000
