#!/bin/bash

echo "🧹 Starting cleanup..."

# stop containers
echo "⏹️  Stopping containers..."
docker stop hiraya-frontend hiraya-backend hiraya-db 2>/dev/null || true

# remove containers
echo "🗑️  Removing containers..."
docker rm hiraya-frontend hiraya-backend hiraya-db 2>/dev/null || true

# remove images
echo "🗑️  Removing Docker images..."
docker rmi hiraya-frontend hiraya-backend 2>/dev/null || true

# remove network
echo "🌐 Removing Docker network..."
docker network rm app-network 2>/dev/null || true

# remove volumes
echo "📦 Removing Docker volumes..."
docker volume rm postgres_data 2>/dev/null || true

echo "✨ Cleanup complete!"