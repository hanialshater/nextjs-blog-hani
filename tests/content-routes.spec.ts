import { expect, test } from '@playwright/test'

const siteUrl = 'https://www.hani-alshater.com'
const slug = 'thinking-became-electric-part-1'

for (const locale of ['en', 'ar']) {
  test(`${locale}: Blog has articles on every valid page`, async ({ request }) => {
    for (const path of ['/blog', '/blog/page/2', '/blog/page/3']) {
      const response = await request.get(`/${locale}${path}`)
      expect(response.status()).toBe(200)
      const html = await response.text()
      expect(html).toContain('<article')
      expect(html).toContain(`href="/${locale}/free-writing/`)
    }
  })

  test(`${locale}: old links redirect and invalid pages return 404`, async ({ request }) => {
    const legacy = await request.get(`/${locale}/blog/${slug}`, { maxRedirects: 0 })
    expect(legacy.status()).toBe(308)
    expect(legacy.headers().location).toBe(`/${locale}/free-writing/${slug}`)
    for (const section of ['blog', 'free-writing']) {
      const first = await request.get(`/${locale}/${section}/page/1`, { maxRedirects: 0 })
      expect(first.status()).toBe(308)
      expect(first.headers().location).toBe(`/${locale}/${section}`)
      for (const page of ['0', '999', '2junk', '1.5']) {
        expect((await request.get(`/${locale}/${section}/page/${page}`)).status()).toBe(404)
      }
    }
  })

  test(`${locale}: article metadata and sharing agree with the canonical route`, async ({
    request,
  }) => {
    const response = await request.get(`/${locale}/free-writing/${slug}`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    const url = `${siteUrl}/${locale}/free-writing/${slug}`
    expect(html).toContain(`rel="canonical" href="${url}"`)
    expect(html).toContain(`hrefLang="en" href="${siteUrl}/en/free-writing/${slug}"`)
    expect(html).toContain(`hrefLang="ar" href="${siteUrl}/ar/free-writing/${slug}"`)
    expect(html).toContain(encodeURIComponent(url))
    expect(html).not.toContain(`href="/${locale}/blog/edp-sort"`)
    const jsonLd = JSON.parse(
      html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]
    )
    expect(jsonLd.url).toBe(url)
    expect(jsonLd.inLanguage).toBe(locale)
    expect(jsonLd.image).toMatch(/^https:\/\//)
    expect(html).toContain(locale === 'ar' ? 'في هذه الصفحة' : 'On this page')
    expect(html).toContain(locale === 'ar' ? 'مقالات ذات صلة' : 'Related Posts')
  })
}

test('feed items have unique localized URLs and drafts stay unpublished', async ({ request }) => {
  const response = await request.get('/feed.xml')
  expect(response.status()).toBe(200)
  const xml = await response.text()
  const guids = [...xml.matchAll(/<guid[^>]*>(.*?)<\/guid>/g)].map((match) => match[1])
  expect(guids.length).toBeGreaterThan(0)
  expect(new Set(guids).size).toBe(guids.length)
  for (const guid of guids) expect(guid).toMatch(/\/((en)|(ar))\/(blog|free-writing)\//)
  expect(xml).toContain(`${siteUrl}/ar/free-writing/${slug}`)
  expect(xml).not.toContain('learning-the-map')
  expect((await request.get('/en/free-writing/learning-the-map')).status()).toBe(404)
  expect(await (await request.get('/search.json')).text()).not.toContain('learning-the-map')
})

test('search opens the actual article and language switching preserves it', async ({ page }) => {
  await page.goto('/en/blog')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await page.getByRole('combobox').fill('When Thought Became Electric')
  await page.getByRole('option').filter({ hasText: 'When Thought Became Electric' }).click()
  await expect(page).toHaveURL(`/en/free-writing/${slug}`)
  await page.getByRole('link', { name: 'Switch to العربية' }).click()
  await expect(page).toHaveURL(`/ar/free-writing/${slug}`)
  await expect(page.getByRole('button', { name: 'تحميل التعليقات' })).toBeVisible()
})
