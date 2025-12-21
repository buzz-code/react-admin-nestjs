# Agent Workflow Documentation

## Project Structure

This is a full-stack application built with:
- **Backend**: NestJS (TypeScript) - located in `/server`
- **Frontend**: React with React-Admin (JavaScript/JSX) - located in `/client`
- **Shared Code**: Git submodules containing shared utilities
  - `client/shared` - [nra-client](https://github.com/buzz-code/nra-client)
  - `server/shared` - [nra-server](https://github.com/buzz-code/nra-server)

## Initial Setup

### 1. Clone Repository with Submodules
```bash
git clone <repository-url>
cd react-admin-nestjs
git submodule update --init --recursive
```

**Important**: The shared submodules MUST be initialized before running tests or building.

### 2. Install Dependencies

Backend:
```bash
cd server
yarn install
```

Frontend:
```bash
cd client
yarn install
```

## Testing Workflow

### Backend Tests (NestJS)
```bash
cd server
yarn test
```
- Test Framework: Jest with ts-jest
- Test Pattern: `*.spec.ts` or `*.test.ts`
- Expected Results: 79 test suites, 789 tests (as of current state)

### Frontend Tests (React)
```bash
cd client
yarn test
```
- Test Framework: Jest with jsdom
- Test Pattern: `*.test.js` or `*.spec.js`
- Expected Results: 11 test suites, 87 tests (as of current state)

### Test Execution Sequence
1. **Always** run backend tests first
2. Then run frontend tests
3. Do not proceed with deployment or Docker setup if tests fail

## Docker Development Workflow

### Configuration Files
- `docker-compose.yml` - Base production configuration
- `docker-compose.override.yml.template` - Development overrides template

### Port Assignments (Local Development)
Sequential port mapping for services:
- **Frontend (Vite)**: 
  - Main dev server: `3000`
  - HMR (Hot Module Replacement): `24678` ⚠️ **Must be exposed**
- **Backend (NestJS)**: `3001` (maps to container port 3000)
- **MySQL**: `3306`
- **PhpMyAdmin**: `8080`

### Volume Management for node_modules Reuse

The Docker setup is optimized to reuse `node_modules` installed on the host machine, preventing duplicate installations inside containers:

```yaml
volumes:
  - ./client:/app          # Mount source code
  - /app/node_modules      # Exclude: use container's node_modules
  - /app/dist             # Exclude: use container's dist
```

**Benefits**:
- Faster container startup
- Reduced disk space usage
- Consistent dependency versions between host and container

### Running Docker Development Environment

1. Copy the override template:
```bash
cp docker-compose.override.yml.template docker-compose.override.yml
```

2. Set up environment:
```bash
cp .env.template .env
# Edit .env with your configuration
```

3. Start services:
```bash
docker compose up -d
```

4. View logs:
```bash
docker compose logs -f frontend
docker compose logs -f backend
```

5. Stop services:
```bash
docker compose down
```

## Puppeteer Configuration

Puppeteer is used for PDF generation in reports and is properly configured in the backend.

### Dockerfile Setup
The backend Dockerfile includes Chromium browser installation:
```dockerfile
RUN apk add --no-cache \
    udev \
    ttf-freefont \
    chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Usage Location
- Primary use: `server/shared/utils/report/markup-to-pdf.generator.ts`
- Purpose: Convert HTML markup to PDF reports
- Configuration: Sandboxed mode with proper flags for Docker environment

### Maintenance Notes
- Keep Puppeteer in the workflow unless it causes blocking issues
- The Chromium version is managed by Alpine package manager
- PDF generation tests are included in the test suite

## Frontend Constants and Configuration

### Vite Configuration
Located in `client/vite.config.js`:

```javascript
server: {
  host: '0.0.0.0',
  port: Number(process.env.PORT || 3000),
  hmr: {
    overlay: true,
    port: 24678,          // HMR WebSocket port
    timeout: 1000,
    clientPort: 24678,
    host: 'localhost',
  },
}
```

### Important Notes
- HMR (Hot Module Replacement) requires port **24678** to be exposed
- The main dev server port defaults to 3000 but can be configured via `PORT` env var
- API URL is configured via `REACT_APP_API_URL` environment variable

## CI/CD Considerations

### Pre-Deployment Checklist
1. ✅ All backend tests pass
2. ✅ All frontend tests pass
3. ✅ Git submodules are up to date
4. ✅ Docker containers build successfully
5. ✅ Environment variables are properly configured

### Build Commands

Backend production build:
```bash
cd server
yarn build
```

Frontend production build:
```bash
cd client
yarn build
```

## Development Best Practices

1. **Always initialize submodules** before starting work
2. **Run tests locally** before committing
3. **Use Docker override** for local development customization
4. **Keep node_modules** on host machine for faster development
5. **Expose HMR port 24678** when running frontend in Docker
6. **Sequential port assignment** prevents conflicts in local development

## Troubleshooting

### Tests Fail with Module Not Found
**Solution**: Initialize git submodules
```bash
git submodule update --init --recursive
```

### Docker Container Can't Find node_modules
**Solution**: Ensure volume exclusions are present in docker-compose configuration
```yaml
volumes:
  - /app/node_modules
  - /app/dist
```

### HMR Not Working in Docker
**Solution**: Ensure port 24678 is exposed in docker-compose.override.yml
```yaml
ports:
  - "24678:24678"
```

### Puppeteer PDF Generation Fails
**Solution**: Verify Chromium is installed in the container and PUPPETEER_EXECUTABLE_PATH is set correctly

## Project Workflow Summary

```
1. Clone Repo → Initialize Submodules
                     ↓
2. Install Dependencies (Backend & Frontend)
                     ↓
3. Run Tests (Sequential: Backend → Frontend)
                     ↓
4. Docker Setup (Copy templates, configure env)
                     ↓
5. Start Development (docker compose up)
                     ↓
6. Develop & Test (Iterate with HMR)
                     ↓
7. Build & Deploy (Production builds)
```

## Database Setup and Migrations

### Initial Database Setup

The MySQL database is initialized automatically when the container first starts using `/db/data.sql`. This file contains:
- Complete database schema (tables, views, indexes)
- Initial migration records
- Sample/seed data

**Important Notes:**
- The `data.sql` file had DEFINER clauses removed for portability across different MySQL user configurations
- The database user specified in `.env` needs full permissions on the database
- Initial setup grants: `GRANT ALL PRIVILEGES ON {MYSQL_DATABASE}.* TO '{MYSQL_USER}'@'%'`

### Database Mounting

The database uses a Docker volume for data persistence:
```yaml
volumes:
  db_data:  # Persists MySQL data across container restarts
```

Data initialization happens automatically via the MySQL Docker image's `/docker-entrypoint-initdb.d/` mechanism:
```dockerfile
# From db/Dockerfile
FROM mysql:8.4
COPY data.sql /docker-entrypoint-initdb.d
```

This runs only on the first container start when the data directory is empty.

### Running Migrations

Migrations are managed by TypeORM and located in `server/src/migrations/`.

#### From Host Machine:
```bash
cd server
yarn typeorm:run     # Run pending migrations (TypeScript)
yarn typeorm:revert  # Revert last migration
```

#### From Docker Container:
```bash
# Run migrations inside the backend container
docker exec backend-dev yarn typeorm:run

# Or for production (uses compiled JavaScript)
docker exec backend-dev yarn typeorm:run:js
```

#### Production Container

The production backend container automatically runs migrations on startup via the `docker-entrypoint.sh` script:
```bash
#!/bin/sh
# Run database migrations
npm run typeorm:run:js

# Start the application
exec npm run start:prod
```

### Migration State Alignment

**Important**: The `data.sql` file contains a database dump with:
1. Complete schema reflecting all migrations up to December 2024
2. A `migrations` table with records of all 126 applied migrations (matching all 124 migration files)

**Status**: The database and migrations are fully aligned. Running `yarn typeorm:run` will show "No migrations are pending" because all migrations have been recorded in the migrations table.

When starting fresh:
- The data.sql automatically initializes the database with all schema changes
- All migration records are present in the `migrations` table
- Running migrations will execute successfully with no errors

### Keeping Database and Code Aligned

To ensure the database schema matches your application code:

1. **For Development**: Use migrations to evolve the schema
   ```bash
   # Generate migration from entity changes
   cd server
   yarn typeorm:generate src/migrations/MyMigrationName
   ```

2. **For Production**: Always run migrations before deploying new code
   - The production Docker container handles this automatically via docker-entrypoint.sh
   - For manual deployments: `yarn typeorm:run:js`

3. **Verify Alignment**:
   ```bash
   # Check which migrations have been run
   docker exec mysql-dev mysql -u{user} -p{pass} -D {database} -e "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10;"
   
   # Count total migrations in database vs codebase
   docker exec mysql-dev mysql -u{user} -p{pass} -D {database} -e "SELECT COUNT(*) FROM migrations;"
   ls server/src/migrations/*.ts | wc -l
   ```

4. **Updating data.sql**: If you need to refresh the data.sql file:
   ```bash
   docker exec mysql-dev mysqldump -u{user} -p{pass} {database} > db/data.sql
   # Remove DEFINER clauses for portability
   sed -i 's/\/\*!50013 DEFINER=`[^`]*`@`[^`]*` SQL SECURITY DEFINER \*\///' db/data.sql
   ```

### Creating New Migrations

```bash
cd server

# Generate a migration from entity changes
yarn typeorm:generate src/migrations/MyMigrationName

# Create an empty migration
yarn typeorm:create src/migrations/MyMigrationName
```

### Database Connection Troubleshooting

If the backend can't connect to MySQL:
1. Ensure all containers are on the same Docker network (`private-network` in dev)
2. Check `MYSQL_HOST` in `.env` matches the MySQL service name (`mysql` in docker-compose)
3. Verify MySQL container is fully started: `docker compose logs mysql`
4. Test connection: `docker exec backend-dev nc -zv mysql 3306`
5. Check permissions: `docker exec mysql-dev mysql -uroot -p{pass} -e "SHOW GRANTS FOR '{user}'@'%';"`

## Additional Resources

- Backend Swagger API Documentation: `/api` endpoint (when running)
- React-Admin Documentation: https://marmelab.com/react-admin/
- NestJS Documentation: https://docs.nestjs.com/
