import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // The book suite starts its own server with isolated content and feedback fixtures.
  testIgnore: '**/books.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: [
            '--no-sandbox',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
          ],
        }
      : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DRAFT_PREVIEW_PASSWORD: '',
      DREAM_REVIEW_PASSWORD: '',
      DREAM_GITHUB_TOKEN: '',
      DREAM_EDITION_REF: '',
      DREAM_FEEDBACK_TOKEN: '',
      DREAM_LOCAL_EDITION_DIR: '',
    },
  },
})
