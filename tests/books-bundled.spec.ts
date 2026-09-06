import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = '/drafts/books/the-dream'

test('complete bilingual book opens from bundled files with no external configuration', async ({
  page,
}) => {
  for (const locale of ['ar', 'en']) {
    let numberedChapters = 0
    for (let part = 1; part <= 4; part++) {
      const edition = JSON.parse(
        await readFile(path.join('data/books/the-dream', `part-${part}.${locale}.json`), 'utf8')
      )
      const response = await page.goto(`${root}/${locale}/part-${part}`)
      expect(response?.status()).toBe(200)
      expect(response?.headers()['www-authenticate']).toBeUndefined()
      await expect(page.locator('[data-chapter]')).toHaveCount(edition.chapters.length)
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
      numberedChapters += edition.chapters.filter(
        (c: { number: number | null }) => c.number !== null
      ).length
    }
    expect(numberedChapters).toBe(55)
    await page.goto(`/drafts/${locale}`)
    await expect(
      page.getByRole('link', {
        name: locale === 'ar' ? 'الحلم — الكتاب كاملًا' : 'The Dream — complete book',
      })
    ).toHaveAttribute('href', `${root}/${locale}/part-1`)
  }
})

test('notes can be downloaded without an inbox token and never claim they were sent', async ({
  page,
}) => {
  const sends: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith(`${root}/feedback`)) sends.push(request.url())
  })
  await page.goto(`${root}/en/part-1`)
  await page.getByRole('button', { name: 'Leave a note', exact: true }).click()
  await page
    .getByLabel('Your note', { exact: true })
    .fill('Preserve this example in the next draft.')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download this note', exact: true }).click()
  const download = await downloadPromise
  const note = JSON.parse(await readFile((await download.path())!, 'utf8'))
  expect(note.comment).toBe('Preserve this example in the next draft.')
  expect(note.locale).toBe('en')
  expect(note.revision).toMatch(/^[a-f0-9]{16}$/)
  await expect(page.getByRole('status')).toContainText('It has not been sent to Hani')
  expect(sends).toEqual([])
})
