# Troubleshooting Guide: 500 Errors After Fresh Database Initialization

## Issue Description

After running `docker compose down -v && docker compose up -d`, some users report that 19 out of 41 entity endpoints return 500 errors. However, this issue cannot be consistently reproduced in all environments.

## Root Causes Identified

### 1. **Git Submodules Not Initialized** (Primary Cause)

The project uses git submodules for shared code:
- `client/shared` - Shared client components
- `server/shared` - Shared server modules (including TypeORM config, auth utilities, etc.)

**Symptoms:**
- Docker build fails with TypeScript errors about missing modules
- Backend container crashes or restarts continuously  
- All view-based endpoints return 500 errors

**Solution:**
```bash
git submodule update --init --recursive
```

**Verification:**
```bash
# Should show files, not empty
ls -la server/shared/
ls -la client/shared/
```

### 2. **Missing Base Data for Views**

The `text_by_user` view requires texts with `user_id = 0` to function correctly. This was missing from the original data.sql file.

**Fixed in commit:** b1cbbab

**Change made:**
```sql
-- Before (caused 500 errors for text_by_user):
INSERT INTO `texts` (`id`, `user_id`, `name`, `description`, `value`) VALUES
(1, 1, 'welcome_message', ...),
(2, 1, 'footer_text', ...),
(3, 2, 'announcement', ...);

-- After (includes base texts with user_id=0):
INSERT INTO `texts` (`id`, `user_id`, `name`, `description`, `value`) VALUES
(1, 0, 'welcome_message', ...),  -- Base text
(2, 0, 'footer_text', ...),      -- Base text
(3, 0, 'announcement', ...),      -- Base text
(4, 1, 'welcome_message', ...),  -- User override
(5, 2, 'announcement', ...);      -- User override
```

### 3. **Missing .env File**

Docker Compose requires environment variables to be configured.

**Symptoms:**
- MySQL container fails to start with "Database is uninitialized and password option is not specified"
- Backend cannot connect to database

**Solution:**
```bash
cp .env.template .env
# Edit .env if needed, or use defaults
```

### 4. **Missing Docker Networks**

The project references external Docker networks that must exist before starting.

**Symptoms:**
- Error: "network caddy declared as external, but could not be found"
- Services fail to start

**Solution:**
```bash
docker network create caddy
docker network create elknet
```

## Complete Recovery Procedure

If you experience 500 errors after `docker compose down -v`, follow these steps:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Initialize git submodules (CRITICAL)
git submodule update --init --recursive

# 3. Verify submodules are populated
ls -la server/shared/  # Should show multiple directories and files
ls -la client/shared/  # Should show multiple directories and files

# 4. Ensure .env file exists
if [ ! -f .env ]; then
    cp .env.template .env
    echo "Created .env file from template"
fi

# 5. Create required Docker networks
docker network create caddy 2>/dev/null || echo "Network caddy already exists"
docker network create elknet 2>/dev/null || echo "Network elknet already exists"

# 6. Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d

# 7. Wait for services to initialize
echo "Waiting for services to be ready..."
sleep 30

# 8. Test all endpoints
export ADMIN_USER=$(grep ADMIN_USER .env | cut -d '=' -f2)
./scripts/test_all_endpoints.sh
```

## Expected Results

After following the recovery procedure, you should see:

```
============================================
API Endpoints Test - [timestamp]
============================================

Logging in...
✓ Login successful

Testing entity endpoints...

[... all 41 endpoints ...]

============================================
Summary:
  Passed: 41
  Failed: 0
============================================
```

## Debugging Failed Endpoints

If endpoints still fail after the recovery procedure, check these:

### Check Backend Logs
```bash
docker compose logs backend | tail -100
```

Look for:
- Database connection errors
- TypeORM initialization errors
- Missing module errors (indicates submodules not initialized)
- View creation errors

### Check Database Initialization
```bash
docker exec mysql mysql -umysql_user -pmysql_password mysql_database -e "SHOW TABLES;"
```

Should show all tables and views including:
- `att_report_with_report_month`
- `text_by_user`
- `student_klass_report`
- `teacher_report_status`
- etc.

### Verify Views Are Created
```bash
docker exec mysql mysql -umysql_user -pmysql_password mysql_database -e "SHOW FULL TABLES WHERE Table_type = 'VIEW';"
```

Should show approximately 19 views.

### Check Specific View
```bash
# Example: Check text_by_user view
docker exec mysql mysql -umysql_user -pmysql_password mysql_database -e "SELECT COUNT(*) FROM text_by_user;"
```

Should return a count > 0.

## Known Working Configuration

The following configuration is verified to work:

- **OS:** Linux (Ubuntu/Debian)
- **Docker:** 24.0+
- **Docker Compose:** 2.20+
- **Git:** 2.34+
- **Git submodules:** Initialized
- **.env file:** Present (copied from .env.template)
- **External networks:** caddy and elknet created

## Prevention

To avoid this issue in the future:

1. **Always initialize submodules after cloning:**
   ```bash
   git clone --recurse-submodules <repository-url>
   ```
   Or after cloning:
   ```bash
   git submodule update --init --recursive
   ```

2. **Add to CI/CD pipeline:**
   ```yaml
   - name: Initialize submodules
     run: git submodule update --init --recursive
   ```

3. **Document in README:** Include submodule initialization as a required setup step

## Additional Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- Project documentation: `API_ENDPOINTS_VALIDATION.md`
- Test script: `scripts/test_all_endpoints.sh`
- Script documentation: `scripts/README.md`
