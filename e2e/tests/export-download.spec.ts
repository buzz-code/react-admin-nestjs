import { test, expect } from '@playwright/test';
import fs from 'fs';
import { registerTestUser, loginThroughUi, markUserAsPaid } from './helpers';

// Downloads a real Excel export of a real list. jsdom cannot exercise this
// at all: the server builds actual .xlsx bytes (see server/shared's
// BaseReportGenerator family) and the client turns a base64 JSON payload
// into a real browser download via file-saver — there is no DOM to render,
// so a mocked-dataProvider unit test has nothing to assert against here.
// This is the file-download counterpart to crud-roundtrip's persistence
// check: it proves the export pipeline produces real, non-empty content,
// not just that clicking the button doesn't throw.
test('exports a real, non-empty Excel file for a resource', async ({ page }) => {
  const { username, password } = await registerTestUser();

  // Exporting is gated on the user's isPaid flag (see server/shared's
  // base-entity.util validateUserHasPaid). There is no self-service way to
  // become paid through the app itself — billing happens outside it — so
  // this reaches directly into the DB, same as registerTestUser reaches
  // around the UI via the API: setup for the flow under test, not the flow
  // itself.
  await markUserAsPaid(username);

  await loginThroughUi(page, username, password);

  // The export button is disabled when the list is empty, so give it one
  // row to actually export.
  await page.goto('/klass_type/create');
  await page.locator('input[name="key"]').fill('1');
  await page.locator('input[name="name"]').fill(`Export Test ${Date.now()}`);
  await page.locator('button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/klass_type$/, { timeout: 10000 });

  await page.getByRole('button', { name: 'ייצא' }).click();

  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
  await page.getByRole('menuitem', { name: 'אקסל' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);

  const path = await download.path();
  expect(path).toBeTruthy();
  const { size } = fs.statSync(path!);
  // A real xlsx (it's a zip container) is at minimum a few hundred bytes;
  // an empty/corrupt response would be at or near 0.
  expect(size).toBeGreaterThan(200);
});
