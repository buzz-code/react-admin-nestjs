#!/bin/sh
set -e

echo "🔄 Starting container initialization..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if node -e "
        const mysql = require('mysql/promise');
        (async () => {
            try {
                const connection = await mysql.createConnection({
                    host: process.env.MYSQL_HOST,
                    user: process.env.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE
                });
                await connection.end();
                process.exit(0);
            } catch (err) {
                process.exit(1);
            }
        })();
    " 2>/dev/null; then
        echo "✅ MySQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ MySQL is not ready after $max_attempts attempts"
        exit 1
    fi
    echo "⏳ Waiting for MySQL... attempt $attempt/$max_attempts"
    sleep 2
done

# Check if migrations table exists and has entries
echo "🔍 Checking database initialization status..."
MIGRATION_COUNT=$(node -e "
    const mysql = require('mysql/promise');
    (async () => {
        try {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM migrations');
            await connection.end();
            console.log(rows[0].count);
            process.exit(0);
        } catch (err) {
            console.log('0');
            process.exit(0);
        }
    })();
" 2>/dev/null)

if [ "$MIGRATION_COUNT" -gt "0" ]; then
    echo "✅ Database already initialized with $MIGRATION_COUNT migrations - skipping migration run"
else
    # Run database migrations
    echo "⏳ Running database migrations..."
    npm run typeorm:run:js
    echo "✅ Migrations completed successfully"
fi

# Start the application
echo "🚀 Starting application..."
exec npm run start:prod