import { expect, test } from '@playwright/test'

test.describe('EDP sort demos', () => {
  test('English demo assets load without page errors and accept an interaction', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    const demos = [
      {
        path: '/demos/posts/edp-sort/mysterious-policy.en.html',
        ready: '#map',
        interact: '.pin',
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
      {
        path: '/demos/posts/edp-sort/pitch-match.en.html',
        ready: '#pitch',
        interact: '#one',
      },
      {
        path: '/demos/posts/edp-sort/pairing-race.html?lang=en',
        ready: '.pr-canvas',
        interact: '[data-f="play"]',
      },
      {
        path: '/demos/posts/edp-sort/topk-scale.en.html',
        ready: '#race',
        interact: '#step',
      },
      {
        path: '/demos/posts/edp-sort/bt-vs-combucb.html?lang=en',
        ready: '#btcb',
        interact: '#btcb-play',
      },
    ]

    for (const demo of demos) {
      await page.goto(demo.path)
      await expect(page.locator(demo.ready)).toBeVisible()
      await page.locator(demo.interact).click()
      await page.waitForTimeout(200)
    }

    expect(errors).toEqual([])
  })
})
