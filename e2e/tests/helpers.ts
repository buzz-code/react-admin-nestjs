import { request } from '@playwright/test';
import mysql from 'mysql2/promise';

const API_BASE_URL = process.env.E2E_API_URL || 'http://localhost:3001';

/**
 * Registers a fresh test user directly against the API (same endpoint and
 * pattern already proven in server/test/*.e2e-spec.ts) rather than relying on
 * seeded DB fixtures, whose password hashes aren't real bcrypt hashes of any
 * known password.
 */
export async function registerTestUser() {
  const apiContext = await request.newContext();
  try {
    const username = `pw_e2e_user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const password = 'TestPass_123';
    const res = await apiContext.post(`${API_BASE_URL}/auth/register`, {
      data: { username, password, name: 'Playwright E2E' },
    });
    if (!res.ok()) {
      throw new Error(`Failed to register test user: ${res.status()} ${await res.text()}`);
    }
    return { username, password };
  } finally {
    await apiContext.dispose();
  }
}

/**
 * Flips a freshly-registered user's `isPaid` flag directly in the database.
 *
 * There is no self-service "pay" flow in this app (billing happens outside
 * it), and the one endpoint that can set isPaid (`/user` bulkUpdatePaid)
 * requires the `showUsersData` permission a fresh registration never has.
 * Some actions — exporting a resource, for one — are gated on isPaid, so a
 * test that needs one of those has no way to arrange that state through the
 * app itself. Reaching directly into the DB here mirrors registerTestUser's
 * own reasoning: this is setup for the flow under test, not the flow itself.
 *
 * Uses the same MYSQL_* env vars (and same local defaults) as the server's
 * own .env — see the e2e README's "Prerequisites" section.
 */
export async function markUserAsPaid(username: string) {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'mysql_user',
    password: process.env.MYSQL_PASSWORD || 'mysql_password',
    database: process.env.MYSQL_DATABASE || 'mysql_database',
  });
  try {
    const [result] = await connection.execute('UPDATE users SET isPaid = 1 WHERE email = ?', [username]);
    // @ts-expect-error mysql2's OkPacket typing doesn't surface affectedRows on the union type
    if (result.affectedRows !== 1) {
      throw new Error(`Expected to mark exactly 1 user as paid, affected ${result.affectedRows}`);
    }
  } finally {
    await connection.end();
  }
}

/** Logs a registered user in through the actual UI form, from /login. */
export async function loginThroughUi(page, username: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: /login|sign in|התחבר|כניסה/i }).click();
  await page.getByRole('menuitem').first().waitFor({ state: 'visible', timeout: 15000 });
}
