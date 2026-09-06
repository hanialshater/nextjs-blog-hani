import { test, expect } from '@playwright/test'

const languages = [
  {
    locale: 'en',
    main: 'Main navigation',
    explore: 'Explore the blog',
    blog: 'Blog',
    open: 'Open menu',
    close: 'Close menu',
    theme: 'Theme switcher',
    system: 'System',
    search: 'Search',
  },
  {
    locale: 'ar',
    main: 'القائمة الرئيسية',
    explore: 'تصفّح المدونة',
    blog: 'المدونة',
    open: 'افتح القائمة',
    close: 'أغلق القائمة',
    theme: 'مظهر الموقع',
    system: 'حسب الجهاز',
    search: 'بحث',
  },
] as const

for (const language of languages) {
  for (const width of [320, 768, 1024, 1440]) {
    test(`${language.locale} navigation fits and follows reading direction at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/${language.locale}`)
      await page.evaluate(() => document.fonts.ready)

      const explore = page.getByRole('navigation', { name: language.explore })
      await expect(explore.getByRole('link')).toHaveCount(4)
      await expect(explore.getByRole('link', { name: language.blog, exact: true })).toHaveCount(1)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width
      )

      const header = page.locator('header').first()
      // Every visible control fits inside the page and has its own horizontal space.
      const controls = await header.locator('a, button').evaluateAll((elements) =>
        elements
          .map((element) => element.getBoundingClientRect())
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => ({ left: rect.left, right: rect.right }))
          .sort((a, b) => a.left - b.left)
      )
      for (const [index, control] of controls.entries()) {
        expect(control.left).toBeGreaterThanOrEqual(0)
        expect(control.right).toBeLessThanOrEqual(width)
        if (index > 0) expect(control.left).toBeGreaterThanOrEqual(controls[index - 1].right)
      }

      if (width >= 1024) {
        const links = header.getByRole('navigation', { name: language.main })
        await expect(links.getByRole('link')).toHaveCount(4)
        await expect(header.getByRole('button', { name: language.open })).toBeHidden()
        const navBox = await links.boundingBox()
        const searchBox = await header.getByRole('button', { name: language.search }).boundingBox()
        if (language.locale === 'ar') {
          expect(navBox!.x).toBeGreaterThan(searchBox!.x + searchBox!.width)
        } else {
          expect(navBox!.x + navBox!.width).toBeLessThan(searchBox!.x)
        }
      } else {
        const opener = header.getByRole('button', { name: language.open })
        await opener.click()
        const dialog = page.getByRole('dialog', { name: language.main })
        await expect(dialog).toBeVisible()
        await expect(header.locator('button[aria-controls="mobile-navigation"]')).toHaveAttribute(
          'aria-expanded',
          'true'
        )
        const links = dialog.getByRole('navigation').getByRole('link')
        await expect(links).toHaveCount(5)
        // The opening animation must finish before checking physical positions.
        await expect
          .poll(async () => (await dialog.getByRole('navigation').boundingBox())!.x)
          .toBe(0)
        const positions = await links.evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect()
            return { left: rect.left, right: rect.right }
          })
        )
        for (const position of positions) {
          if (language.locale === 'ar') {
            expect(position.left).toBeGreaterThan(width / 2)
            expect(position.right).toBeCloseTo(width - (width < 640 ? 32 : 48), 0)
          } else {
            expect(position.right).toBeLessThan(width / 2)
            expect(position.left).toBeCloseTo(width < 640 ? 32 : 48, 0)
          }
        }
        await expect(dialog.getByRole('button', { name: language.close })).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
        await expect(opener).toBeFocused()

        await opener.click()
        await dialog.getByRole('link', { name: language.blog, exact: true }).click()
        await expect(page).toHaveURL(`/${language.locale}/blog`)
        await expect(dialog).toBeHidden()
        await expect
          .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).overflow))
          .not.toBe('hidden')
      }

      // The dropdown remains on-screen and its localized choices can be selected.
      await header.getByRole('button', { name: language.theme }).click()
      const menu = page.getByRole('menu', { name: language.theme })
      await expect(menu).toBeVisible()
      const menuBox = await menu.boundingBox()
      expect(menuBox!.x).toBeGreaterThanOrEqual(0)
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(width)
      await menu.getByRole('menuitem', { name: language.system, exact: true }).click()
      await expect(menu).toBeHidden()

      if (width === 768) {
        await header.getByRole('button', { name: language.open }).click()
        await page.setViewportSize({ width: 1024, height: 900 })
        await expect(page.getByRole('dialog')).toBeHidden()
        await expect
          .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).overflow))
          .not.toBe('hidden')
      }
    })
  }
}
