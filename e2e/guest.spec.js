import { test, expect } from '@playwright/test';

// Guest flow: no account, no backend dependency — everything is read from
// and written to localStorage via src/lib/csPlatform.js. Each test gets a
// fresh browser context (Playwright default), so there's no prior state to
// clean up.
test('guest can complete a lesson, take its quiz, and see it on the Dashboard', async ({
  page,
}) => {
  await page.goto('/learn/array');

  const markCompleteBtn = page.getByRole('button', { name: 'Mark Lesson Complete' });
  await markCompleteBtn.click();
  await expect(page.getByRole('button', { name: 'Lesson Completed' })).toBeDisabled();

  // The page also has an unrelated nav link with the same "Take quiz"
  // text, so target this lesson's specific quiz link by href instead.
  await page.locator('a[href="/quiz/arrays"]').click();
  await expect(page).toHaveURL(/\/quiz\/arrays$/);

  // Answer every question (always the first option — correctness doesn't
  // matter for this test, only that a result gets recorded) until the
  // summary screen appears.
  const summaryHeading = page.getByRole('heading', { name: 'Quiz Summary' });
  for (let i = 0; i < 20 && !(await summaryHeading.isVisible().catch(() => false)); i++) {
    await page.locator('.answer-options button').first().click();
    await page.getByRole('button', { name: /Next question|Finish Quiz/ }).click();
  }
  await expect(summaryHeading).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByText(/browsing as a guest/i)).toBeVisible();

  const lessonsCompletedCard = page.locator('.stat-card').filter({ hasText: 'Lessons Completed' });
  await expect(lessonsCompletedCard.locator('.stat-value')).toHaveText('1');

  const arraysRow = page.locator('.topic-row').filter({ hasText: 'Arrays' });
  await expect(arraysRow.locator('.topic-count')).toHaveText('1 / 10');
});
