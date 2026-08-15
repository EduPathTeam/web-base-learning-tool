import { test, expect } from '@playwright/test';
import { pool } from './db.js';

const email = `e2e-feedback-${Date.now()}@example.com`;

test.afterAll(async () => {
  await pool.query('DELETE FROM feedback WHERE email = ?', [email]);
  await pool.end();
});

test('submitting the feedback form shows a success state', async ({ page }) => {
  await page.goto('/feedback');

  await page.getByLabel('Your Name').fill('E2E Feedback Tester');
  await page.getByLabel('Email Address').fill(email);
  // 4th star of 5 — the rating widget is a row of icons, not a form
  // control with individual labels.
  await page.locator('.star-rating i').nth(3).click();
  await page.getByLabel('Your Message').fill('Automated end-to-end test submission.');

  await page.getByRole('button', { name: 'Send Feedback' }).click();

  await expect(page.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send More Feedback' })).toBeVisible();
});
