# GitHub Copilot Instructions for react-admin-nestjs

## Project Overview

This is a full-stack educational management system built with:
- **Frontend**: React 18 with React-Admin 5.3 and Vite 2.7 (JavaScript/JSX)
- **Backend**: NestJS 9 with TypeORM (TypeScript)
- **Database**: MySQL
- **Architecture**: Monorepo with Git submodules for shared utilities

### Repository Structure

```
/client          - React Admin frontend application
/server          - NestJS backend application
/db              - MySQL database configuration and seed data
/client/shared   - Git submodule: nra-client (shared client components)
/server/shared   - Git submodule: nra-server (shared server modules)
```

## Essential Setup Requirements

### Git Submodules
**CRITICAL**: This project uses Git submodules that MUST be initialized before any development:

```bash
git submodule update --init --recursive
```

The shared submodules contain essential utilities and components. **Never modify code without initializing submodules first**, as this will cause import errors and test failures.

### Installation

Backend:
```bash
cd server && yarn install
```

Frontend:
```bash
cd client && yarn install
```

## Development Workflow

### Testing Strategy

**ALWAYS run tests in this order:**

1. **Backend tests first** (server directory):
   ```bash
   cd server && yarn test
   ```
   - Framework: Jest with ts-jest
   - Expected: 79 test suites, 789 tests
   - Pattern: `*.spec.ts` or `*.test.ts`

2. **Frontend tests second** (client directory):
   ```bash
   cd client && yarn test
   ```
   - Framework: Jest with jsdom
   - Expected: 11 test suites, 87 tests
   - Pattern: `*.test.js` or `*.spec.js`

**Do not proceed with deployment or Docker builds if tests fail.**

### Building

Backend production build:
```bash
cd server && yarn build
```

Frontend production build:
```bash
cd client && yarn build
```

## Coding Standards & Conventions

### Backend (NestJS/TypeScript)

1. **Entity Configuration Pattern**:
   - Place TypeORM entities in `/server/src/db/entities/`
   - Create entity modules in `/server/src/entity-modules/` following the `*.config.ts` pattern
   - Register new entities in `/server/src/entities.module.ts`
   - Use dependency injection consistently

2. **TypeScript Standards**:
   - Use TypeScript for all server code
   - Follow NestJS module/controller/service pattern
   - Use decorators appropriately (`@Controller`, `@Injectable`, etc.)
   - Maintain proper typing throughout

3. **Testing**:
   - Test files should be colocated with source files using `*.spec.ts` pattern
   - Use NestJS testing utilities
   - Mock external dependencies

### Frontend (React/JavaScript)

1. **Entity Definition Pattern**:
   - Create entity definitions in `/client/src/entities/` as `.jsx` files
   - Register resources in `/client/src/App.jsx` with proper icons and menu groups
   - Follow React-Admin conventions for List, Create, Edit, Show components

2. **Code Style**:
   - Use JSX for React components
   - Prefer functional components with hooks
   - Use Material-UI components consistently
   - Follow existing component structure patterns

3. **Shared Components**:
   - Reuse components from `/client/shared/components/`
   - Use established providers (dataProvider, authProvider, i18nProvider)
   - Leverage utility functions from `/client/shared/utils/`

4. **Testing**:
   - Test files should be colocated using `*.test.js` pattern
   - Use Jest with jsdom for component testing

## Docker Development

### Configuration Files
- `docker-compose.yml` - Base production configuration
- `docker-compose.override.yml.template` - Development overrides template (copy to `.yml` for use)

### Port Assignments
- Frontend (Vite): Port `3000` with HMR on `24678` (HMR port MUST be exposed)
- Backend (NestJS): Port `3001` (maps to container 3000)
- MySQL: Port `3306`
- PhpMyAdmin: Port `8080`

### Volume Strategy
Docker is configured to reuse host `node_modules`:

```yaml
volumes:
  - ./client:/app
  - /app/node_modules  # Exclude: use container's node_modules
  - /app/dist          # Exclude: use container's dist
```

**Benefits**: Faster startup, reduced disk usage, consistent dependencies

### Running Development Environment

1. Copy templates:
   ```bash
   cp docker-compose.override.yml.template docker-compose.override.yml
   cp .env.template .env
   ```

2. Configure environment variables in `.env`

3. Start services:
   ```bash
   docker-compose up -d
   ```

## Special Considerations

### Puppeteer for PDF Generation

The backend uses Puppeteer for PDF report generation:
- Primary use: `server/shared/utils/report/markup-to-pdf.generator.ts`
- Chromium is installed in the Docker container
- Keep Puppeteer configuration unless it causes blocking issues
- The `PUPPETEER_EXECUTABLE_PATH` is set to `/usr/bin/chromium-browser`

### Internationalization

- Primary language: Hebrew (RTL support enabled)
- Translation keys in `/client/src/domainTranslations.js`
- i18n provider: `/client/shared/providers/i18nProvider.js`

### Authentication & Authorization

- JWT-based authentication
- Auth module: `/server/shared/auth/auth.module.ts`
- Permission utilities: `/client/shared/utils/permissionsUtil.js`
- Configure admin credentials via environment variables

### External Integrations

**Yemot Phone System Integration**:
- Chain configurations in `/server/src/yemot/`
- Used for phone-based attendance reporting and teacher interactions

## Common Tasks

### Adding a New Entity

1. **Backend**:
   - Create TypeORM entity in `/server/src/db/entities/MyEntity.ts`
   - Create config in `/server/src/entity-modules/my-entity.config.ts`
   - Register in `/server/src/entities.module.ts`

2. **Frontend**:
   - Create entity definition in `/client/src/entities/my-entity.jsx`
   - Register resource in `/client/src/App.jsx`
   - Add translations to `/client/src/domainTranslations.js`

3. **Test both sides** before considering the task complete

### Creating Reports

1. **Backend generator**: `/server/src/reports/myReport.ts`
2. **Frontend component**: `/client/src/reports/myReportButton.jsx`
3. Use Puppeteer for PDF generation if needed

### Updating Shared Utilities

**IMPORTANT**: The `/client/shared` and `/server/shared` directories are Git submodules pointing to separate repositories:
- Client shared: https://github.com/buzz-code/nra-client
- Server shared: https://github.com/buzz-code/nra-server

**Do not modify these directly** unless you intend to update the upstream repositories.

## Troubleshooting

### "Module Not Found" Errors
**Solution**: Initialize git submodules
```bash
git submodule update --init --recursive
```

### Docker Volume Issues
**Solution**: Ensure volume exclusions are in docker-compose configuration:
```yaml
volumes:
  - /app/node_modules
  - /app/dist
```

### HMR Not Working in Docker
**Solution**: Expose port 24678 in `docker-compose.override.yml`:
```yaml
ports:
  - "24678:24678"
```

### Puppeteer PDF Failures
**Solution**: Verify Chromium installation in container and `PUPPETEER_EXECUTABLE_PATH` environment variable

## Pre-Commit Checklist

When making changes:
- [ ] Git submodules are initialized
- [ ] Dependencies installed (both client and server)
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Code follows established patterns
- [ ] New entities registered in both frontend and backend
- [ ] Translations updated if adding UI strings
- [ ] Documentation updated if changing workflows

## Environment Variables

Key environment variables to configure (see `.env.template`):
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`
- `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_NAME`
- `SMTP_USER`, `SMTP_PASSWORD` (for email functionality)
- `DOMAIN_NAME` (for deployments)
- `REACT_APP_API_URL` (frontend API endpoint)

## Documentation References

- Project Index: `/project-index.md` - Comprehensive file and module reference
- Agent Workflow: `/AGENTS.md` - Detailed development workflow guide
- New Project Checklist: `/new-project-checklist.md` - Template for creating similar projects
- Backend API: Swagger documentation at `/api` endpoint (when running)
- React-Admin: https://marmelab.com/react-admin/
- NestJS: https://docs.nestjs.com/

## Key Principles

1. **Minimal Changes**: Make surgical, precise modifications
2. **Test-First**: Always run existing tests before and after changes
3. **Follow Patterns**: Use existing code structure as a guide
4. **Git Submodules**: Never forget to initialize them
5. **Sequential Testing**: Backend tests → Frontend tests → Docker build
6. **Documentation**: Keep project documentation in sync with code changes
