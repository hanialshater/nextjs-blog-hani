import { defineConfig, devices } from '@playwright/test'
import { randomBytes } from 'node:crypto'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { makeBookFixture } from './scripts/book-test-fixture.mjs'

const directory = await mkdtemp(path.join(tmpdir(), 'dream-reader-tests-'))
await makeBookFixture(directory)
process.env.DREAM_REVIEW_PASSWORD ||= randomBytes(32).toString('hex')
process.env.DRAFT_PREVIEW_PASSWORD ||= randomBytes(32).toString('hex')
process.env.DREAM_LOCAL_EDITION_DIR ||= directory
process.env.DREAM_TEST_MOCK_STORE ||= path.join(directory, 'feedback.json')
const port = process.env.DREAM_TEST_PORT || '3100'
export default defineConfig({
  testDir: './tests',
  testMatch: 'books.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] }
      : {},
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/drafts/books/the-dream/ar/part-1`,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DREAM_REVIEW_PASSWORD: process.env.DREAM_REVIEW_PASSWORD,
      DRAFT_PREVIEW_PASSWORD: process.env.DRAFT_PREVIEW_PASSWORD,
      DREAM_LOCAL_EDITION_DIR: process.env.DREAM_LOCAL_EDITION_DIR,
      DREAM_GITHUB_TOKEN: 'synthetic-test-token',
      DREAM_TEST_MOCK_STORE: process.env.DREAM_TEST_MOCK_STORE,
      NODE_OPTIONS: `--require=${path.resolve('tests/book-github-mock.cjs')}`,
    },
  },
})
