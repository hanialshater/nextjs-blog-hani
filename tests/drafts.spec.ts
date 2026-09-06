import { expect, test } from '@playwright/test'

test('drafts open by link without a password or an authentication challenge', async ({
  request,
}) => {
  for (const url of [
    '/drafts/en',
    '/drafts/ar',
    '/drafts/en/hello-bundle',
    '/drafts/assets/hello-bundle/demos/counter.html',
  ]) {
    const response = await request.get(url)
    expect(response.status()).toBe(200)
    expect(response.headers()['www-authenticate']).toBeUndefined()
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  const redirect = await request.get('/drafts', { maxRedirects: 0 })
  expect(redirect.status()).toBe(307)
  expect(redirect.headers().location).toBe('/drafts/en')
  const staleLogin = await request.get('/drafts/en/hello-bundle', {
    headers: { Authorization: 'Basic obsolete-browser-credential' },
  })
  expect(staleLogin.status()).toBe(200)
})

test('readers can open both languages while normal article routes stay unpublished', async ({
  request,
}) => {
  for (const locale of ['en', 'ar']) {
    const response = await request.get(`/drafts/${locale}`)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`/drafts/${locale}/hello-bundle`)
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  const response = await request.get('/drafts/en/hello-bundle')
  const html = await response.text()
  expect(response.status()).toBe(200)
  expect(html).toContain('Hello, Self-Contained Post')
  expect(html).toContain('/drafts/assets/hello-bundle/images/cover.png')
  expect(html).toContain('/drafts/assets/hello-bundle/demos/counter.html')
  expect(html).not.toContain('Load Comments')
  expect(html).not.toContain('twitter.com/intent/tweet')
  expect(html).not.toContain('application/ld+json')
  expect(html).not.toContain('vercel-insights')

  // Unlisted reading must not publish the ordinary article routes.
  expect((await request.get('/drafts/en/hello-bundle')).status()).toBe(200)
  expect((await request.get('/en/free-writing/hello-bundle')).status()).toBe(404)
  expect((await request.get('/en/blog/hello-bundle')).status()).toBe(404)
  expect((await request.get('/drafts/en/edp-sort')).status()).toBe(404)
})

test('draft assets open by link and remain absent from normal asset paths', async ({ request }) => {
  for (const asset of ['images/cover.png', 'demos/counter.html']) {
    const response = await request.get(`/drafts/assets/hello-bundle/${asset}`)
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN')
    expect((await response.body()).length).toBeGreaterThan(0)
  }
  for (const url of [
    '/static/images/posts/hello-bundle/cover.png',
    '/demos/posts/hello-bundle/counter.html',
    '/drafts/assets/hello-bundle/index.mdx',
    '/drafts/assets/hello-bundle/images/%2e%2e%2findex.mdx',
  ])
    expect((await request.get(url)).status()).toBe(404)
})

test('draft metadata is absent from public discovery', async ({ request }) => {
  for (const url of ['/en/blog', '/ar/blog', '/search.json', '/feed.xml', '/sitemap.xml']) {
    const response = await request.get(url)
    const text = await response.text()
    expect(text).not.toContain('learning-the-map')
    expect(text).not.toContain('hello-bundle')
    expect(text).not.toContain('/drafts/')
  }
})

test('readers can view draft images, interact with a demo and switch language', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
  })
  try {
    const page = await context.newPage()
    await page.goto('/drafts/en/hello-bundle')
    await expect(page.getByRole('heading', { name: 'Hello, Self-Contained Post' })).toBeVisible()
    const cover = page.locator('img[src*="/drafts/assets/hello-bundle/images/cover.png"]').first()
    await expect(cover).toBeVisible()
    await expect
      .poll(() => cover.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0)
    await page.locator('iframe[title="Counter demo"]').scrollIntoViewIfNeeded()
    const demo = page.frameLocator('iframe[title="Counter demo"]')
    await demo.locator('#inc').click()
    await expect(demo.locator('#value')).toHaveText('1')
    await page.getByRole('link', { name: 'العربية', exact: true }).click()
    await expect(page).toHaveURL('/drafts/ar/hello-bundle')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  } finally {
    await context.close()
  }
})
