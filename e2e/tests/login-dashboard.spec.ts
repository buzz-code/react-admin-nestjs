import { test, expect, request } from '@playwright/test';

const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:3001';

// Registers a fresh test user directly against the API (same endpoint and
// pattern already proven in server/test/*.e2e-spec.ts) rather than relying on
// seeded DB fixtures, whose password hashes aren't real bcrypt hashes of any
// known password.
async function registerTestUser() {
  const apiContext = await request.newContext();
  const username = `pw_e2e_user_${Date.now()}`;
  const password = 'TestPass_123';
  const res = await apiContext.post(`${API_BASE_URL}/auth/register`, {
    data: { username, password, name: 'Playwright E2E' },
  });
  if (!res.ok()) {
    throw new Error(`Failed to register test user: ${res.status()} ${await res.text()}`);
  }
  await apiContext.dispose();
  return { username, password };
}

test('login redirects to a working dashboard', async ({ page }) => {
  const { username, password } = await registerTestUser();

  await page.goto('/login');

  // react-admin's default LoginForm renders TextInputs with source="username"/"password"
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /login|sign in|התחבר|כניסה/i }).click();

  // Successful login redirects off the login page into the admin shell.
  // The sidebar menu (role=menuitem) only renders once auth + permissions
  // resolve and the layout mounts without crashing.
  const menuItems = page.getByRole('menuitem');
  await expect(menuItems.first()).toBeVisible({ timeout: 15000 });
  await expect(menuItems).not.toHaveCount(0);

  // No leftover login form, and no error page reached instead of the dashboard.
  await expect(page.locator('input[name="password"]')).toHaveCount(0);
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
});
