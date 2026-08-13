import { defineConfig } from '@playwright/test';
import { existsSync } from 'fs';

// The sandboxed dev environment this pilot was first built in ships a
// pre-installed Chromium under $PLAYWRIGHT_BROWSERS_PATH (/opt/pw-browsers)
// with a stable `chromium` symlink to the current versioned build — using
// it avoids a redundant download there. GitHub Actions runners (and most
// other environments) don't have that path at all, so this only pins
// executablePath when the path is actually present; otherwise it's left
// undefined and Playwright falls back to its own managed browser (installed
// via `npx playwright install --with-deps chromium` — see the CI workflow
// and this package's README).
const sandboxChromium = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    launchOptions: {
      ...(existsSync(sandboxChromium) ? { executablePath: sandboxChromium } : {}),
      args: ['--no-sandbox'],
    },
    screenshot: 'only-on-failure',
  },
});
