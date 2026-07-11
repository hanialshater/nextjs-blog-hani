import { expect, test, type Page } from '@playwright/test'

const arabic = /[\u0600-\u06ff]/

async function expectEnglishDemo(page: Page, path: string, ready: string, action: string) {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(path)
  await expect(page.locator(ready)).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  expect(await page.locator('body').innerText()).not.toMatch(arabic)

  await page.locator(action).click()
  await page.waitForTimeout(250)
  expect(pageErrors).toEqual([])
}

test.describe('When Thought Became Electric English edition', () => {
  test('the English article loads as an LTR edition', async ({ page }) => {
    await page.goto('/en/free-writing/thinking-became-electric-part-1')

    await expect(page.getByRole('heading', { name: /When Thought Became Electric/ })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
    await expect(page.getByText('Collision board').first()).toBeVisible()
  })

  test('all four localized demos load and accept their first interaction', async ({ page }) => {
    const demos = [
      {
        path: '/demos/posts/thinking-became-electric-part-1/ngram-table.en.html',
        ready: '#ng-training-text',
        action: '#ng-guide-action',
      },
      {
        path: '/demos/posts/thinking-became-electric-part-1/skipgram-lab.en.html',
        ready: '#wv-training-text',
        action: '#wv-guide-action',
      },
      {
        path: '/demos/posts/thinking-became-electric-part-1/rnn-memory.en.html',
        ready: '#rnn-training-text',
        action: '#rnn-guide-action',
      },
      {
        path: '/demos/posts/thinking-became-electric-part-1/hume-induction.en.html',
        ready: '#plot',
        action: '#action',
      },
    ]

    for (const demo of demos) {
      await expectEnglishDemo(page, demo.path, demo.ready, demo.action)
    }
  })
})
