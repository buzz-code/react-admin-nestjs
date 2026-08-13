import { test, expect } from '@playwright/test';
import { registerTestUser, loginThroughUi } from './helpers';

// Exercises a real dataProvider <-> nestjs-crud round trip through the
// actual UI: create, appears in the list, edit, change is visible, delete,
// gone from the list. jsdom's entities.test.js smoke tests (mocked
// dataProvider) prove pages don't crash on mount; they can't prove a create
// actually persists, an edit actually updates, or a delete actually removes
// a row — that needs a real server and a real database.
//
// klass_type is used because as a non-admin user (a fresh registration,
// same as the login test) it only requires two fields — key (number) and
// name (text) — with no reference picker to drive; every other field on
// this app's entities that was checked either needed a reference-select
// dropdown or is admin-only.
test('create, edit and delete a klass type through the real UI and API', async ({ page }) => {
  const { username, password } = await registerTestUser();
  await loginThroughUi(page, username, password);

  const uniqueSuffix = Date.now();
  const originalName = `E2E Klass ${uniqueSuffix}`;
  const updatedName = `E2E Klass ${uniqueSuffix} (updated)`;

  // --- Create ---
  await page.goto('/klass_type/create');
  await page.locator('input[name="key"]').fill('1');
  await page.locator('input[name="name"]').fill(originalName);
  await page.locator('button[type="submit"]').first().click();

  // A successful create redirects to the list, which is the read half of
  // the round trip: the row has to come back from a real GET, not just be
  // assumed present because the POST returned 2xx.
  await expect(page).toHaveURL(/\/klass_type$/, { timeout: 10000 });
  await expect(page.getByText(originalName, { exact: true })).toBeVisible({ timeout: 10000 });

  // --- Edit ---
  await page.getByText(originalName, { exact: true }).click();
  await expect(page).toHaveURL(/\/klass_type\/\d+$/, { timeout: 10000 });
  const nameInput = page.locator('input[name="name"]');
  await nameInput.fill(updatedName);
  await page.locator('button[type="submit"]').first().click();

  await expect(page).toHaveURL(/\/klass_type$/, { timeout: 10000 });
  await expect(page.getByText(updatedName, { exact: true })).toBeVisible({ timeout: 10000 });
  // The pre-edit name should be gone, not just the new one added alongside it.
  await expect(page.getByText(originalName, { exact: true })).toHaveCount(0);

  // --- Delete ---
  await page.locator('input[type="checkbox"]').nth(1).check();
  await page.getByRole('button', { name: 'מחק' }).click();
  await page.getByRole('button', { name: 'אשר' }).click();

  await expect(page.getByText(updatedName, { exact: true })).toHaveCount(0, { timeout: 10000 });
});
