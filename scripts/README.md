# Scripts Directory

This directory contains utility scripts for testing and validating the react-admin-nestjs application.

## test_all_endpoints.sh

**Purpose:** Automated testing of all registered entity endpoints in the NestJS backend.

**Usage:**

```bash
# Set credentials from .env file
export ADMIN_USER="admin_user:admin_password"

# From within Docker network (recommended)
docker run --rm --network react-admin-nestjs_private-network \
  -e ADMIN_USER="${ADMIN_USER}" \
  -v $(pwd)/scripts/test_all_endpoints.sh:/test_all_endpoints.sh \
  curlimages/curl:latest sh /test_all_endpoints.sh

# Or expose backend port and run locally
docker compose up -d
sleep 15
export ADMIN_USER=$(grep ADMIN_USER .env | cut -d '=' -f2)
./scripts/test_all_endpoints.sh
```

**Environment Variables:**

- `ADMIN_USER` - Admin credentials in format "username:password" (from .env file)
- `BACKEND_URL` - Backend URL (default: http://backend:3000)

**What it does:**

1. Authenticates with admin credentials from `.env` file
2. Tests GET requests to all 41 registered entity endpoints
3. Reports success/failure with HTTP status codes
4. Outputs detailed error information for any failed endpoints

**Requirements:**

- Docker Compose services must be running
- Admin credentials must be provided via `ADMIN_USER` environment variable (format: "username:password")
- For Docker network execution: `curlimages/curl:latest` image

**Output:**

```
============================================
API Endpoints Test - [timestamp]
============================================

Logging in...
✓ Login successful

Testing entity endpoints...

Testing user                                     ... ✓ OK (HTTP 200)
Testing att_report                               ... ✓ OK (HTTP 200)
...
Testing lesson_klass_name                        ... ✓ OK (HTTP 200)

============================================
Summary:
  Passed: 41
  Failed: 0
============================================
```

**Integration:**

This script can be integrated into CI/CD pipelines to validate that:
- Database migrations don't break existing endpoints
- Seed data (`db/data.sql`) is properly aligned with entity schemas
- All registered entities are properly configured

**Related Documentation:**

- See `API_ENDPOINTS_VALIDATION.md` for the latest validation report
- See `server/src/entities.module.ts` for the list of registered entities
