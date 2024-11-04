#!/bin/sh

# Wait for database
echo 'Waiting for database...'
while ! nc -z db 5432; do
  sleep 1
done
echo 'Database is ready!'

# Initialize database
python init_db.py

# Migrate providers data
python migrate_providers.py

# Verify migration
python verify_db.py

# Start the application
python main.py