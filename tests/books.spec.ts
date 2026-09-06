import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = '/drafts/books/the-dream'
const source = async (locale: string, part: number) =>
  JSON.parse(
    await readFile(
      path.join(process.env.DREAM_LOCAL_EDITION_DIR!, `part-${part}.${locale}.json`),
      'utf8'
    )
  )

async function openLab(page: Page, kind: string) {
  const lab = page.locator(`[data-lab="${kind}"]`)
  await lab.evaluate((element) => {
    const details = element.closest('details')
    if (details) details.open = true
  })
  await lab.scrollIntoViewIfNeeded()
  return lab
}

test('book pages and server component requests open without credentials', async ({ request }) => {
  for (const url of [`${root}/ar/part-1`, `${root}/en/part-3?_rsc=reading`]) {
    const response = await request.get(url, { headers: { RSC: '1' } })
    expect(response.status()).toBe(200)
    expect(response.headers()['www-authenticate']).toBeUndefined()
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  expect((await request.get('/drafts/ar')).status()).toBe(200)
  expect((await request.get(`${root}/en/part-5`)).status()).toBe(404)
  expect(
    (
      await request.get(`${root}/en/part-2`, { headers: { Authorization: 'Basic stale-login' } })
    ).status()
  ).toBe(200)
})

test.describe('reading without passwords', () => {
  test('all eight reading pages contain the full aligned chapter map', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    for (const locale of ['ar', 'en'])
      for (let part = 1; part <= 4; part++) {
        const edition = await source(locale, part)
        const response = await page.goto(`${root}/${locale}/part-${part}`)
        expect(response?.status()).toBe(200)
        await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
        await expect(page.locator('[data-chapter]')).toHaveCount(edition.chapters.length)
        expect(
          await page.locator('[data-chapter]').evaluateAll((nodes) => nodes.map((n) => n.id))
        ).toEqual(edition.chapters.map((c: { id: string }) => c.id))
        expect(await page.locator('script[src*="analytics"], iframe[src*="giscus"]').count()).toBe(
          0
        )
      }
    expect(errors).toEqual([])
  })

  test('chapter position survives a language change and is saved locally', async ({ page }) => {
    await page.goto(`${root}/en/part-2#chapter-10`)
    await page.locator('#chapter-10').scrollIntoViewIfNeeded()
    await expect(page.locator('header a[lang="ar"]')).toHaveAttribute(
      'href',
      `${root}/ar/part-2#chapter-10`
    )
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('dream:position:en') || 'null')?.chapter
        )
      )
      .toBe('chapter-10')
    await page.locator('header a[lang="ar"]').click()
    await expect(page).toHaveURL(new RegExp('/ar/part-2#chapter-10$'))
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  })

  test('feedback is tied to a passage and saved only after successful submission', async ({
    page,
  }) => {
    const edition = await source('en', 2)
    await page.goto(`${root}/en/part-2`)
    const passage = page.locator('[data-chapter] [data-passage]').first()
    const id = await passage.getAttribute('id')
    await passage.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
    })
    await page.getByRole('button', { name: 'Leave a note', exact: true }).click()
    await expect(page.locator('dialog')).toBeVisible()
    await page.getByLabel('What did you notice?').selectOption('correction')
    await page
      .getByLabel('Your note', { exact: true })
      .fill('Test note: preserve the concrete example. @nobody')
    await page.getByRole('button', { name: 'Send privately to Hani', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Your note was saved for Hani. Thank you.')
    const issues = JSON.parse(await readFile(process.env.DREAM_TEST_MOCK_STORE!, 'utf8'))
    expect(issues[0].body).toContain(`Revision: ${edition.revision}`)
    expect(issues[0].body).toContain(`Passage: ${id}`)
    expect(issues[0].body).toContain('Category: correction')
    expect(issues[0].body).toContain('@\u200bnobody')
    expect(await page.evaluate(() => localStorage.getItem('dream:unsent:en:2'))).toBeNull()
  })

  test('a failed submission retains an unsent note and never claims success', async ({ page }) => {
    await page.goto(`${root}/en/part-1`)
    await page.route(`**${root}/feedback`, (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"code":"unavailable"}',
      })
    )
    await page.getByRole('button', { name: 'Leave a note', exact: true }).click()
    await page.getByLabel('Your note', { exact: true }).fill('Keep this unsent note for a retry.')
    await page.getByRole('button', { name: 'Send privately to Hani', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('not sent')
    expect(await page.evaluate(() => localStorage.getItem('dream:unsent:en:1'))).toContain(
      'Keep this unsent note'
    )
  })

  test('the first four labs produce their worked numerical results', async ({ page }) => {
    await page.goto(`${root}/en/part-2`)
    const descent = await openLab(page, 'descent')
    await descent.getByRole('button', { name: 'One gradient step', exact: true }).click()
    await expect(descent.locator('output')).toContainText('a = 1.5333')
    await descent.getByRole('button', { name: 'One gradient step', exact: true }).click()
    await expect(descent.locator('output')).toContainText('a = 1.6356')
    const russell = await openLab(page, 'russell')
    for (const assumption of ['Assume yes', 'Assume no']) {
      await russell.getByRole('button', { name: assumption, exact: true }).click()
      await expect(russell.locator('output')).toContainText('Contradiction')
    }
    const bayes = await openLab(page, 'bayes')
    await expect(bayes.locator('output')).toContainText('15.38%')
    await bayes.locator('input').focus()
    await page.keyboard.press('End')
    await expect(bayes.locator('output')).toContainText('94.74%')
    const coding = await openLab(page, 'coding')
    await expect(coding.locator('output').first()).toContainText('= 90')
    await coding.getByRole('button', { name: 'Decode by factorization', exact: true }).click()
    await expect(coding.locator('output').last()).toContainText('[1, 2, 1]')
    await coding.locator('select').selectOption('2,1,1')
    await expect(coding.locator('output').first()).toContainText('= 60')
  })

  test('machines, circuits, delayed feedback, and sampling work', async ({ page }) => {
    await page.goto(`${root}/en/part-3`)
    const turing = await openLab(page, 'turing')
    for (let i = 0; i < 4; i++)
      await turing.getByRole('button', { name: 'One step', exact: true }).click()
    await expect(turing.locator('output')).toContainText('HALTED')
    await expect(turing.locator('output')).toContainText('Output: 4')
    await turing.locator('select').selectOption('loop')
    for (let i = 0; i < 5; i++)
      await turing.getByRole('button', { name: 'One step', exact: true }).click()
    await expect(turing.locator('output')).toContainText('RUNNING')
    const circuits = await openLab(page, 'circuits')
    await circuits.getByRole('button', { name: 'A = 0', exact: true }).click()
    await circuits.getByRole('button', { name: 'B = 0', exact: true }).click()
    await expect(circuits.locator('output')).toContainText('1 + 1 = 10₂ = 2₁₀')
    const feedback = await openLab(page, 'feedback')
    for (let i = 0; i < 2; i++)
      await feedback.getByRole('button', { name: 'Apply one correction', exact: true }).click()
    await expect(feedback.locator('output')).toContainText('x = 7.5')
    await feedback.locator('input').nth(1).focus()
    await page.keyboard.press('End')
    for (let i = 0; i < 5; i++)
      await feedback.getByRole('button', { name: 'Apply one correction', exact: true }).click()
    await expect(feedback.locator('output')).toContainText('x = 22.5')
    const monte = await openLab(page, 'monte-carlo')
    await monte.getByRole('button', { name: 'Sample 100 points', exact: true }).click()
    await expect(monte.locator('output')).toContainText('N = 100')
    await expect(monte.locator('svg circle')).toHaveCount(100)
    const first = await monte.locator('output').innerText()
    await monte.getByRole('button', { name: 'Restart with seed 42', exact: true }).click()
    await monte.getByRole('button', { name: 'Sample 100 points', exact: true }).click()
    expect(await monte.locator('output').innerText()).toBe(first)
  })

  test('Arabic mobile pages and opened experiments stay within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (let part = 1; part <= 4; part++) {
      await page.goto(`${root}/ar/part-${part}`)
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
      ).toBe(true)
    }
    await page.goto(`${root}/ar/part-3#chapter-22`)
    await openLab(page, 'turing')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    ).toBe(true)
    await page.screenshot({ path: 'test-results/dream-ar-mobile.png' })
  })
})

test('feedback rejects cross-origin, stale, oversized, and unknown-passage requests', async ({
  request,
  baseURL,
}) => {
  const edition = await source('en', 2)
  const chapter = edition.chapters.find((c: { id: string }) => c.id === 'chapter-10')
  const body = {
    locale: 'en',
    part: 2,
    revision: edition.revision,
    chapter: chapter.id,
    passage: Object.keys(chapter.passages)[0],
    quote: '',
    comment: 'A test note.',
    category: 'example',
    submission: '12345678-1234-1234-1234-123456789012',
  }
  const headers = { Origin: baseURL! }
  const cross = await request.post(`${root}/feedback`, {
    headers: { ...headers, Origin: 'https://example.invalid' },
    data: body,
  })
  expect(cross.status()).toBe(403)
  const stale = await request.post(`${root}/feedback`, {
    headers,
    data: { ...body, revision: 'ffffffffffffffff' },
  })
  expect(stale.status()).toBe(409)
  const passage = await request.post(`${root}/feedback`, {
    headers,
    data: { ...body, passage: 'chapter-10-does-not-exist' },
  })
  expect(passage.status()).toBe(400)
  const large = await request.post(`${root}/feedback`, {
    headers,
    data: { ...body, comment: 'x'.repeat(17000) },
  })
  expect(large.status()).toBe(413)
})
