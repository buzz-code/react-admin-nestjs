import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    // Pre-installed browser in this environment (under $PLAYWRIGHT_BROWSERS_PATH,
    // /opt/pw-browsers) — avoids re-downloading. `chromium` is a stable symlink
    // to the current versioned build, so this doesn't need updating on bumps.
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium',
      args: ['--no-sandbox'],
    },
    screenshot: 'only-on-failure',
  },
});
