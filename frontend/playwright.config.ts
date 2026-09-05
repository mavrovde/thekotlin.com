import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            // prod-smoke targets the nginx prod stack (:20443) and only runs via ./run_prod_smoke.sh
            testIgnore: /prod-smoke\.spec\.ts/,
        },
        ...(process.env.PROD_SMOKE
            ? [
                  {
                      name: 'prod-smoke',
                      use: { ...devices['Desktop Chrome'] },
                      testMatch: /prod-smoke\.spec\.ts/,
                  },
              ]
            : []),
    ],
    // The prod-smoke run tests the docker stack directly; no dev server needed.
    ...(process.env.PROD_SMOKE
        ? {}
        : {
              webServer: {
                  command: process.env.CI ? 'npm run start' : 'npm run dev',
                  url: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
                  reuseExistingServer: !process.env.CI,
                  timeout: 120_000,
              },
          }),
});
