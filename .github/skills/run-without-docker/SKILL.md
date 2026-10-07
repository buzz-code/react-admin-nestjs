---
name: run-without-docker
description: Use when Docker isn't available (e.g. sandboxed remote sessions) and you need to run an NRA project's client+server against a real MySQL instance — standing up local MySQL, configuring server/.env, starting the dev servers, and the login smoke test. For generating/verifying a TypeORM migration against that database, see generate-migration instead.
---

# Skill: Run a Project Without Docker

> **Use this skill when:** `docker-compose` isn't available and you need a real running stack — local MySQL + NestJS dev server + Vite dev client — instead of Docker containers.

---

## MySQL ports per project

These are the Docker-compose ports; when running local MySQL you don't need to match them (just point `.env` at whatever port you actually used), but they're handy if you're running multiple projects' *containers* side by side.

| Project | MySQL Port |
|---|---|
| `react-admin-nestjs` | 3306 |
| `event-management-nra` | 3316 |
| `teacher-report-nra` | 3326 |
| `student-report-nra` | 3336 |
| `dnd-management-nra` | 3346 |

## 1. Install and start MySQL 8

```bash
apt-get update -qq && apt-get install -y -qq mysql-server-8.0
service mysql start
```

## 2. Create the database and user

```bash
mysql -u root -e "
CREATE DATABASE mysql_database CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'mysql_user'@'localhost' IDENTIFIED BY 'mysql_password';
GRANT ALL PRIVILEGES ON mysql_database.* TO 'mysql_user'@'localhost';
GRANT SYSTEM_USER ON *.* TO 'mysql_user'@'localhost';
FLUSH PRIVILEGES;
"
```

`SYSTEM_USER` is required — some migrations run `DROP VIEW`, which MySQL 8 gates behind that privilege.

## 3. Point the server at it

```bash
cd $WORKSPACES_ROOT/<project>/server
cat > .env <<'EOF'
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=mysql_user
MYSQL_PASSWORD=mysql_password
MYSQL_DATABASE=mysql_database
JWT_SECRET=jwt_secret
EOF
export $(cat .env | xargs)
```

## 4. Apply migrations

From an empty database, just replay everything:

```bash
yarn install
NODE_ENV=development yarn typeorm:run
```

**Shortcut:** if the project has `db/data.sql` at its root (a schema checkpoint dump with the `migrations` table pre-populated up to some earlier commit), loading it first and then running only the remaining migrations is faster than replaying full history:

```bash
cd $WORKSPACES_ROOT/<project>
mysql -u root mysql_database < db/data.sql   # strip any `GRANT ... TO 'user'@'%'` lines first if it errors — docker-init-specific
cd server && NODE_ENV=development yarn typeorm:run
```

This checkpoint-and-replay approach is also what `generate-migration` uses to get a DB at exactly current HEAD's schema before diffing a new entity change — use that skill instead of this one when the goal is producing a migration file, not just running the app.

## 5. Start the dev servers

```bash
# Server
cd $WORKSPACES_ROOT/<project>/server
yarn start:dev

# Client (separate shell)
cd $WORKSPACES_ROOT/<project>/client
yarn install
yarn start
```

## 6. Login smoke test

Open the client's dev URL and sign in with `admin_user` / `admin_password`. The dashboard should load without errors. For a deeper check of every API route, use the `smoke-test-project` skill.
