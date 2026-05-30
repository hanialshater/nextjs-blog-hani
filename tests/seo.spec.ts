import { expect, test, type Page } from '@playwright/test'

const siteUrl = 'https://www.hani-alshater.com'

async function expectCanonical(page: Page, expectedHref: string) {
  const canonical = page.locator('link[rel="canonical"]')
  await expect(canonical).toHaveCount(1)
  await expect(canonical).toHaveAttribute('href', expectedHref)
}

async function expectLanguageAlternates(page: Page, path: string) {
  await expect(page.locator('link[rel="alternate"][hrefLang="en"]')).toHaveAttribute(
    'href',
    `${siteUrl}/en${path}`
  )
  await expect(page.locator('link[rel="alternate"][hrefLang="ar"]')).toHaveAttribute(
    'href',
    `${siteUrl}/ar${path}`
  )
}

test.describe('SEO metadata', () => {
  test('robots.txt allows crawling and references sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.ok()).toBeTruthy()

    const body = await response.text()
    expect(body).toContain('User-Agent: *')
    expect(body).toContain('Allow: /')
    expect(body).toContain(`${siteUrl}/sitemap.xml`)
  })

  test('sitemap.xml exposes localized index pages and does not expose missing tags pages', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBeTruthy()

    const body = await response.text()
    for (const path of ['', '/blog', '/free-writing', '/projects', '/demos', '/about']) {
      expect(body).toContain(`${siteUrl}/en${path}`)
      expect(body).toContain(`${siteUrl}/ar${path}`)
    }
    expect(body).not.toContain(`${siteUrl}/en/tags`)
    expect(body).not.toContain(`${siteUrl}/ar/tags`)
  })

  test('English localized pages expose stable canonicals and alternates', async ({ page }) => {
    for (const path of ['', '/blog', '/free-writing', '/projects', '/demos', '/about']) {
      await page.goto(`/en${path}`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'en')
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
      await expectCanonical(page, `${siteUrl}/en${path}`)
      await expectLanguageAlternates(page, path)
      await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    }
  })

  test('Arabic localized pages expose stable canonicals and alternates', async ({ page }) => {
    for (const path of ['', '/blog', '/free-writing', '/projects', '/demos', '/about']) {
      await page.goto(`/ar${path}`)
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
      await expectCanonical(page, `${siteUrl}/ar${path}`)
      await expectLanguageAlternates(page, path)
      await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    }
  })
})
