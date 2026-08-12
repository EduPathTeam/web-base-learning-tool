import { test, expect } from '@playwright/test';
import { pool } from './db.js';

const email = `e2e-auth-${Date.now()}@example.com`;
const password = 'password123';
const displayName = 'E2E Auth Tester';

test.afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = ?', [email]);
  await pool.end();
});

test('register, sign out, sign back in on a fresh browser context, and see progress persisted from the server', async ({
  page,
  browser,
}) => {
  await page.goto('/sign-up');
  await page.getByLabel('Name').fill(displayName);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(`Welcome back, ${displayName}!`)).toBeVisible();

  // Create real progress and wait for it to actually reach the server
  // (the sync fires from the UI without the caller awaiting it) before
  // switching browser contexts, so the next login has nothing to fall
  // back on except what the server actually persisted.
  await page.goto('/learn/array');
  const syncResponse = page.waitForResponse(
    (res) => res.url().includes('/progress/lesson-complete') && res.status() === 204
  );
  await page.getByRole('button', { name: 'Mark Lesson Complete' }).click();
  await syncResponse;

  // Scoped to the desktop nav — Header.jsx also renders a second Sign Out
  // button in the mobile nav, which is in the DOM (just CSS-hidden) at
  // this viewport width and would otherwise make this locator ambiguous.
  await page
    .locator('nav.nav')
    .getByRole('button', { name: /Sign Out/ })
    .click();
  await expect(page).toHaveURL('/');

  // A fresh context has empty localStorage and no cookies, simulating a
  // different device. Anything the Dashboard shows here can only have
  // come from the server via syncFromServer() on login.
  const freshContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  await freshPage.goto('/sign-in');
  await freshPage.getByLabel('Email').fill(email);
  await freshPage.getByLabel('Password').fill(password);
  await freshPage.getByRole('button', { name: 'Sign In' }).click();

  await expect(freshPage).toHaveURL(/\/dashboard$/);
  const lessonsCompletedCard = freshPage
    .locator('.stat-card')
    .filter({ hasText: 'Lessons Completed' });
  await expect(lessonsCompletedCard.locator('.stat-value')).toHaveText('1');

  await freshContext.close();
});
