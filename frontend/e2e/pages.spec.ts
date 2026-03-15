import { test, expect } from '@playwright/test';

test.describe('Content Pages', () => {
    test('articles page renders with search bar', async ({ page }) => {
        await page.goto('/articles');

        await expect(page.getByPlaceholder('Search articles...').first()).toBeVisible();
        // Should show "All Articles" heading or category-filtered heading
        await expect(page.getByRole('heading', { name: /All Articles|Articles/i }).first()).toBeVisible();
    });

    test('news page renders', async ({ page }) => {
        await page.goto('/news');

        await expect(page.getByRole('heading', { name: 'Kotlin News' })).toBeVisible();
    });

    test('forum page renders', async ({ page }) => {
        await page.goto('/forum');

        await expect(page.getByRole('heading', { name: 'Community Forum' })).toBeVisible();
    });

    test('categories page renders', async ({ page }) => {
        await page.goto('/categories');

        await expect(page.getByRole('heading', { name: /Topics|Categories/i })).toBeVisible();
    });

    test('articles page shows empty state or articles', async ({ page }) => {
        await page.goto('/articles');

        // Either articles are shown or empty state
        await expect(page.locator('.article-card, .empty-state').first()).toBeVisible();
    });
});
