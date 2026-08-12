import { defineConfig, devices } from '@playwright/test';

// Separate from the fast unit/integration suites (npm test) — run
// explicitly with `npm run test:e2e`. Needs a local MySQL configured the
// same way server/test/api.test.js does (see README.md); the auth and
// feedback specs exercise the real backend, not a mock.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Two entries (not `npm run dev:all`) so Playwright waits for each
  // server's own health check independently — a single combined command
  // only proved the frontend was listening, so the auth/feedback specs
  // could start firing requests at a backend that was still booting.
  webServer: [
    {
      command: 'npm run dev --prefix server',
      url: 'http://localhost:4000/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
