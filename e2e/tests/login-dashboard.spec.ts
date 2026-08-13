import { test, expect } from '@playwright/test';
import { registerTestUser } from './helpers';

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
