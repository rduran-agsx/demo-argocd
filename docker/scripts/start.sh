#!/bin/bash

# exit on error
set -e

# change to root directory
cd ../..

echo "🚀 Starting Hiraya application setup..."

# load env vars
if [ -f .env ]; then
    echo "📚 Loading environment variables..."
    export $(cat .env | xargs)
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# setup network
echo "🌐 Setting up Docker network..."
docker network create app-network 2>/dev/null || true

# cleanup containers
echo "🧹 Cleaning up existing containers..."
docker rm -f hiraya-db hiraya-backend hiraya-frontend 2>/dev/null || true

# start db
echo "🐘 Starting PostgreSQL database..."
docker run -d --name hiraya-db \
    --network app-network \
    --env-file .env \
    -e POSTGRES_USER=${DB_USER} \
    -e POSTGRES_PASSWORD=${DB_PASSWORD} \
    -e POSTGRES_DB=${DB_NAME} \
    -p 5433:5432 \
    -v postgres_data:/var/lib/postgresql/data \
    postgres:14-alpine

# wait for db
echo "⏳ Waiting for PostgreSQL to start..."
while ! nc -z localhost ${DB_PORT} 2>/dev/null; do
    echo "   Still waiting..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# setup backend
echo "🏗️  Building backend..."
docker build -t hiraya-backend -f backend/Dockerfile.backend ./backend

echo "🔧 Initializing database..."
docker run --rm --network app-network \
    -v ${PWD}/backend:/app \
    -v ${PWD}/backend/providers:/app/providers \
    --env-file .env \
    --add-host=host.docker.internal:host-gateway \
    hiraya-backend python init_db.py

echo "📦 Running data migration..."
docker run --rm --network app-network \
    -v ${PWD}/backend:/app \
    -v ${PWD}/backend/providers:/app/providers \
    --env-file .env \
    --add-host=host.docker.internal:host-gateway \
    hiraya-backend python migrate_providers.py

echo "✔️  Verifying database..."
docker run --rm --network app-network \
    -v ${PWD}/backend:/app \
    --env-file .env \
    --add-host=host.docker.internal:host-gateway \
    hiraya-backend python verify_db.py

# start backend
echo "🚀 Starting backend service..."
docker run -d --name hiraya-backend \
    --network app-network \
    -p 5000:5000 \
    -v ${PWD}/backend:/app \
    -v ${PWD}/backend/providers:/app/providers \
    --env-file .env \
    --add-host=host.docker.internal:host-gateway \
    -e CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://host.docker.internal:3000" \
    hiraya-backend python main.py

# setup frontend
echo "🏗️  Building frontend..."
docker build -t hiraya-frontend -f frontend/Dockerfile.frontend ./frontend

# start frontend
echo "🚀 Starting frontend..."
docker run -d --name hiraya-frontend \
    --network app-network \
    -p 3000:3000 \
    -v ${PWD}/frontend:/app \
    -v /app/node_modules \
    -e REACT_APP_API_URL=http://host.docker.internal:5000 \
    -e NODE_ENV=development \
    -e WATCHPACK_POLLING=true \
    --add-host=host.docker.internal:host-gateway \
    hiraya-frontend

echo "🎉 Setup complete! The application should be running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"

# verify services
sleep 3
echo "🔍 Verifying services..."
if docker ps | grep -q "hiraya-frontend" && docker ps | grep -q "hiraya-backend" && docker ps | grep -q "hiraya-db"; then
    echo "✅ All services are running successfully!"
else
    echo "❌ Some services failed to start. Please check the logs:"
    echo "   Frontend logs: docker logs hiraya-frontend"
    echo "   Backend logs: docker logs hiraya-backend"
    echo "   Database logs: docker logs hiraya-db"
fi