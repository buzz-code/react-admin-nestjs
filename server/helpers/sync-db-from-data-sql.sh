#!/bin/bash

# Script to sync database with data.sql file
# This rebuilds the database from data.sql to ensure schema is in sync

set -e

echo "🔄 Syncing database from data.sql..."

# Check if docker compose is running
if ! docker compose ps mysql | grep -q "Up"; then
    echo "❌ Database container is not running. Please start it with: docker compose up -d mysql"
    exit 1
fi

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
timeout=30
counter=0
until docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout waiting for MySQL to be ready"
        exit 1
    fi
done

echo "✅ MySQL is ready"

# Get database credentials from environment or use defaults
DB_NAME=${MYSQL_DATABASE:-mysql_database}
DB_USER=${MYSQL_USER:-mysql_user}
DB_PASSWORD=${MYSQL_PASSWORD:-mysql_password}

# Drop and recreate database
echo "🗑️  Dropping existing database..."
docker compose exec mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;"

echo "📦 Creating fresh database..."
docker compose exec mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import data.sql
echo "📥 Importing data.sql..."
docker compose exec -T mysql mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < db/data.sql

echo "✅ Database synced successfully!"
echo ""
echo "💡 You can now run: docker compose exec backend yarn typeorm:generate src/migrations/migrationMeaningfulName -p --dr"
