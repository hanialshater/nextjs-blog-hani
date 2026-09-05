import { expect, test } from '@playwright/test'

function authorization(password = process.env.DRAFT_PREVIEW_PASSWORD!) {
  return `Basic ${Buffer.from(`hani:${password}`).toString('base64')}`
}

test('draft routes and assets reject anonymous and invalid access', async ({ request }) => {
  for (const url of [
    '/drafts',
    '/drafts/en',
    '/drafts/ar',
    '/drafts/en/learning-the-map',
    '/drafts/assets/hello-bundle/images/cover.png',
    '/drafts/assets/hello-bundle/demos/counter.html',
  ]) {
    const response = await request.get(url, { maxRedirects: 0 })
    expect(response.status()).toBe(401)
    expect(response.headers()['www-authenticate']).toContain('Basic')
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(await response.text()).not.toContain('Learning the Map')
  }
  const attempts: Record<string, string>[] = [
    { Authorization: authorization('incorrect-password') },
    { Authorization: 'Basic !!!' },
    { Cookie: '__prerender_bypass=forged' },
    {
      RSC: '1',
      'x-middleware-subrequest': 'middleware:middleware:middleware:middleware:middleware',
    },
  ]
  for (const headers of attempts) {
    const response = await request.get('/drafts/en/learning-the-map', { headers })
    expect([401, 404]).toContain(response.status())
    expect(await response.text()).not.toContain('Learning the Map')
  }
})

test('owner can read drafts in both languages without making them public', async ({ request }) => {
  const headers = { Authorization: authorization() }
  for (const locale of ['en', 'ar']) {
    const response = await request.get(`/drafts/${locale}`, { headers })
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`/drafts/${locale}/hello-bundle`)
    expect(response.headers()['cache-control']).toContain('no-store')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  const response = await request.get('/drafts/en/hello-bundle', { headers })
  const html = await response.text()
  expect(response.status()).toBe(200)
  expect(html).toContain('Hello, Self-Contained Post')
  expect(html).toContain('/drafts/assets/hello-bundle/images/cover.png')
  expect(html).toContain('/drafts/assets/hello-bundle/demos/counter.html')
  expect(html).not.toContain('Load Comments')
  expect(html).not.toContain('twitter.com/intent/tweet')
  expect(html).not.toContain('application/ld+json')
  expect(html).not.toContain('vercel-insights')

  // A privileged response must not prime a public cache or publish its source.
  expect((await request.get('/drafts/en/hello-bundle')).status()).toBe(401)
  expect((await request.get('/en/free-writing/hello-bundle', { headers })).status()).toBe(404)
  expect((await request.get('/en/blog/hello-bundle', { headers })).status()).toBe(404)
  expect((await request.get('/drafts/en/edp-sort', { headers })).status()).toBe(404)
})

test('draft assets require access and are absent from public asset paths', async ({ request }) => {
  const headers = { Authorization: authorization() }
  for (const asset of ['images/cover.png', 'demos/counter.html']) {
    const response = await request.get(`/drafts/assets/hello-bundle/${asset}`, { headers })
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('no-store')
    expect((await response.body()).length).toBeGreaterThan(0)
  }
  for (const url of [
    '/static/images/posts/hello-bundle/cover.png',
    '/demos/posts/hello-bundle/counter.html',
    '/drafts/assets/hello-bundle/index.mdx',
    '/drafts/assets/hello-bundle/images/%2e%2e%2findex.mdx',
  ])
    expect((await request.get(url, { headers })).status()).toBe(404)
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

test('owner can view draft images, interact with a demo and switch language', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    httpCredentials: { username: 'hani', password: process.env.DRAFT_PREVIEW_PASSWORD! },
  })
  try {
    const page = await context.newPage()
    await page.goto('/drafts/en/hello-bundle')
    await expect(page.getByRole('heading', { name: 'Hello, Self-Contained Post' })).toBeVisible()
    const cover = page.locator('img[src*="/drafts/assets/hello-bundle/images/cover.png"]')
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
