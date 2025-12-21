# Development Guide

## Project Structure

Full-stack application with:
- **Backend**: NestJS (TypeScript) in `/server`
- **Frontend**: React with React-Admin (JavaScript/JSX) in `/client`
- **Shared Code**: Git submodules (automatically initialized by Docker)
  - `client/shared` - [nra-client](https://github.com/buzz-code/nra-client)
  - `server/shared` - [nra-server](https://github.com/buzz-code/nra-server)

## Quick Start

**All development is done through Docker containers - no local setup required!**

### 1. Clone Repository
```bash
git clone <repository-url>
cd react-admin-nestjs
git submodule update --init --recursive
```

### 2. Setup Environment
```bash
cp docker-compose.override.yml.template docker-compose.override.yml
cp .env.template .env
# Edit .env with your configuration
```

### 3. Install Dependencies (Before Starting Docker)
Dependencies must be installed on the host machine before starting containers (due to volume mounting):
```bash
cd server && yarn install
cd ../client && yarn install
cd ..
```

### 4. Start Docker Stack
```bash
docker compose up -d
```

**View Logs:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

**Stop:**
```bash
docker compose down
```

**Services:**
- Frontend: http://localhost:3000 (HMR on port 24678)
- Backend API: http://localhost:3001
- MySQL: localhost:3306
- PhpMyAdmin: http://localhost:8080

## Database Management

### Initialization
Database automatically initializes from `db/data.sql` on first MySQL container start. The file contains:
- Complete schema with all tables and views
- All 126 migration records (fully aligned with codebase)

### Running Migrations
```bash
# From host (TypeScript):
cd server && yarn typeorm:run

# From Docker container:
docker exec backend-dev yarn typeorm:run
```

**Expected result**: "No migrations are pending" ✅ (all migrations are pre-recorded in data.sql)

### Creating New Migrations
```bash
cd server
yarn typeorm:generate src/migrations/MigrationName  # Generate from entity changes
yarn typeorm:create src/migrations/MigrationName    # Create empty migration
```

After creating migrations, you must update `db/data.sql` to include the new migration records.

### Troubleshooting Database
```bash
# Verify migrations count
docker exec mysql-dev mysql -utestuser -ptestpass123 -D testdb \
  -e "SELECT COUNT(*) FROM migrations;"

# Check MySQL logs
docker compose logs mysql

# Grant permissions if needed
docker exec mysql-dev mysql -uroot -p{rootpass} \
  -e "GRANT ALL PRIVILEGES ON testdb.* TO 'testuser'@'%'; FLUSH PRIVILEGES;"
```

## Testing

Tests are run inside Docker containers:

**Backend (NestJS + Jest):**
```bash
docker exec backend-dev yarn test
```

**Frontend (React + Jest):**
```bash
docker exec frontend-dev yarn test
```

**Always** run backend tests before frontend tests.

## Key Files

- `docker-compose.yml` - Production configuration
- `docker-compose.override.yml` - Development overrides (not in git)
- `.env` - Environment variables (not in git)
- `db/data.sql` - Database initialization with all migrations
- `server/src/migrations/` - TypeORM migration files (124 files)

## Notes

- **Puppeteer/PDF**: Backend includes Chromium for PDF report generation (`server/shared/utils/report/`)
- **Submodules**: Must be initialized before building/testing - contains shared utilities
- **node_modules**: Docker volumes exclude node_modules to use container's version (faster builds)
- **Network**: Development uses `private-network` bridge for inter-container communication

## Production Build

```bash
docker compose build
docker compose up -d
```

Production containers run migrations automatically on startup via `docker-entrypoint.sh`.
