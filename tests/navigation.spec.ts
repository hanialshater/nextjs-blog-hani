import { test, expect } from '@playwright/test';

test.describe('Navigation and Free Writing Page', () => {
  test('should have "Free Writing" link in header pointing to /free-writing', async ({ page }) => {
    await page.goto('/');
    const freeWritingLink = page.getByRole('link', { name: 'Free Writing' });
    await expect(freeWritingLink).toBeVisible();
    await expect(freeWritingLink).toHaveAttribute('href', '/free-writing');
  });

  test('should load /free-writing page and display correct title', async ({ page }) => {
    await page.goto('/free-writing');
    await expect(page).toHaveTitle(/Free Writing/);
    const pageTitle = page.getByRole('heading', { name: 'Free Writing' });
    await expect(pageTitle).toBeVisible();
  });

  test('/free-writing page should list sample free writing post and not a blog post', async ({ page }) => {
    await page.goto('/free-writing');

    // Check for the sample free writing post
    const samplePostTitle = 'My First Free Writing Post';
    const samplePostLink = page.getByRole('link', { name: samplePostTitle });
    await expect(samplePostLink).toBeVisible();

    // Check that a regular blog post is NOT listed
    const regularBlogPostTitle = 'The Time Machine'; // Title of a known blog post
    const regularPostLink = page.getByRole('link', { name: regularBlogPostTitle });
    await expect(regularPostLink).not.toBeVisible();
  });
});
