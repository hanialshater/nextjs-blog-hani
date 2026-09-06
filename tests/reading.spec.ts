import { expect, test } from '@playwright/test'

for (const locale of ['en', 'ar']) {
  for (const width of [390, 1440]) {
    test(`${locale} articles load their reading font and fit a ${width}px viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/${locale}/free-writing/agent-autonomy`)
      await expect(page.locator('#article-content')).toBeVisible()
      const metrics = await page.locator('#article-content').evaluate(async (element) => {
        await document.fonts.ready
        const style = getComputedStyle(element)
        const paragraph = element.querySelector('p')!
        return {
          family: style.fontFamily,
          size: parseFloat(style.fontSize),
          loaded: Array.from(document.fonts).some(
            (font) =>
              style.fontFamily.includes(font.family.replaceAll('"', '')) && font.status === 'loaded'
          ),
          paragraphWidth: paragraph.getBoundingClientRect().width,
          viewport: document.documentElement.clientWidth,
          pageWidth: document.documentElement.scrollWidth,
          articleTop: element.getBoundingClientRect().top,
          titleBottom: document.querySelector('main h1')!.getBoundingClientRect().bottom,
        }
      })
      expect(metrics.family).toContain(locale === 'ar' ? 'arabicReading' : 'englishReading')
      expect(metrics.loaded).toBe(true)
      expect(metrics.size).toBeGreaterThanOrEqual(locale === 'ar' ? 22 : 19)
      expect(metrics.paragraphWidth).toBeLessThanOrEqual(700)
      expect(metrics.pageWidth).toBeLessThanOrEqual(metrics.viewport + 1)
      // Desktop prose must start alongside the sidebar, not below its entire TOC.
      if (width >= 1280) expect(metrics.articleTop - metrics.titleBottom).toBeLessThan(300)
    })
  }

  test(`${locale} draft figures and technical notes work with keyboard controls`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
    })
    try {
      const page = await context.newPage()
      await page.goto(`/drafts/${locale}/hello-bundle`)
      const note = page.locator('.technical-note')
      await expect(note).not.toHaveAttribute('open', '')
      await note.locator('summary').press('Enter')
      await expect(note).toHaveAttribute('open', '')
      await expect(note.locator('pre')).toBeVisible()
      expect(
        await note.locator('pre').evaluate((element) => getComputedStyle(element).direction)
      ).toBe('ltr')

      const figure = page.locator('.article-figure').first()
      const trigger = figure.getByRole('button', {
        name: locale === 'ar' ? /تكبير الصورة/ : /Enlarge image/,
      })
      await trigger.press('Enter')
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')
      await expect(
        dialog.getByRole('button', { name: locale === 'ar' ? /إغلاق الصورة/ : /Close image/ })
      ).toBeFocused()
      const image = dialog.locator('img')
      await expect(image).toHaveAttribute('src', '/drafts/assets/hello-bundle/images/cover.png')
      await expect
        .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
        .toBeGreaterThan(0)
      await dialog
        .getByRole('button', { name: locale === 'ar' ? 'الحجم الأصلي' : 'Actual size' })
        .click()
      await expect(
        dialog.getByRole('button', { name: locale === 'ar' ? 'ملاءمة الشاشة' : 'Fit to screen' })
      ).toHaveAttribute('aria-pressed', 'true')
      await page.keyboard.press('Escape')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
      await expect
        .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
        .not.toBe('hidden')

      // The existing book illustration component must use the draft asset route too.
      const illustration = page.locator('.article-figure').last().locator('img')
      await expect(illustration).toHaveAttribute(
        'src',
        '/drafts/assets/hello-bundle/images/cover.png'
      )
      await expect
        .poll(() => illustration.evaluate((element: HTMLImageElement) => element.naturalWidth))
        .toBeGreaterThan(0)
    } finally {
      await context.close()
    }
  })
}

test('technical notes remain readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  })
  try {
    const page = await context.newPage()
    await page.goto('/drafts/en/hello-bundle')
    const note = page.locator('.technical-note')
    await note.locator('summary').click()
    await expect(note.locator('pre')).toBeVisible()
  } finally {
    await context.close()
  }
})
