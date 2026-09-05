import { expect, test } from '@playwright/test'

test.describe('EDP sort demos', () => {
  const demos = [
    {
      path: '/demos/posts/edp-sort/mysterious-policy.en.html',
      ready: '#map',
      interact: '.pin:has-text("Saffron Table")',
    },
    {
      path: '/demos/posts/edp-sort/bandit-race-averaged.en.html',
      ready: '#chart',
      interact: '#scenario',
    },
    {
      path: '/demos/posts/edp-sort/bandit-contextual.html?lang=en',
      ready: '#ctxcanvas',
      interact: '#ctx1',
    },
    { path: '/demos/posts/edp-sort/pitch-match.html?lang=en', ready: '#pitch', interact: '#one' },
    {
      path: '/demos/posts/edp-sort/pairing-race.html?lang=en',
      ready: '#chart',
      interact: '#run',
    },
    { path: '/demos/posts/edp-sort/dueling-rucb.html', ready: '#table', interact: '#step' },
    { path: '/demos/posts/edp-sort/topk-scale.html?lang=en', ready: '#race', interact: '#step' },
    {
      path: '/demos/posts/edp-sort/bt-vs-combucb.html?lang=en',
      ready: '#btcb',
      interact: '#btcb-play',
    },
  ]

  for (const demo of demos) {
    test(`${demo.path} loads and accepts an interaction`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(demo.path)
      await expect(page.locator(demo.ready)).toBeVisible()
      await page.locator(demo.interact).click()
      await page.waitForTimeout(200)
      expect(errors).toEqual([])
    })
  }
})
