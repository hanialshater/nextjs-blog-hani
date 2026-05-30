import { test, expect } from '@playwright/test'

test.describe('Navigation and localized content pages', () => {
  test('should have localized header links for writing, projects, and demos', async ({ page }) => {
    await page.goto('/en')

    const header = page.locator('header')
    await expect(header.getByRole('link', { name: 'Free Writing' })).toHaveAttribute(
      'href',
      '/en/free-writing'
    )
    await expect(header.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/en/projects'
    )
    await expect(header.getByRole('link', { name: 'Demos' })).toHaveAttribute('href', '/en/demos')
  })

  test('should load the localized free-writing page and display current posts', async ({
    page,
  }) => {
    await page.goto('/en/free-writing')

    await expect(page).toHaveTitle(/Free Writing/)
    await expect(page.getByRole('heading', { name: 'Free Writing' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Agent Autonomy - Part 2/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'The Time Machine' })).not.toBeVisible()
  })

  test('should list standalone mini demos and open an individual demo shell', async ({ page }) => {
    await page.goto('/en/demos')

    await expect(page.getByRole('heading', { name: 'Demos', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Algorithm Playground' })).toBeVisible()

    await page.getByRole('link', { name: 'Algorithm Playground' }).first().click()
    await expect(page).toHaveURL(/\/en\/demos\/algorithm-playground$/)
    await expect(page.getByRole('heading', { name: 'Algorithm Playground' })).toBeVisible()
  })
})
