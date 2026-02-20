import { test, expect } from '@playwright/test';

test.describe('Content Pages', () => {
    test('articles page renders with search bar', async ({ page }) => {
        await page.goto('/articles');

        await expect(page.getByPlaceholder('Search articles...')).toBeVisible();
        // Should show "All Articles" heading or category-filtered heading
        await expect(page.getByText(/All Articles|Articles/i).first()).toBeVisible();
    });

    test('news page renders', async ({ page }) => {
        await page.goto('/news');

        await expect(page.getByText('Kotlin News')).toBeVisible();
    });

    test('forum page renders', async ({ page }) => {
        await page.goto('/forum');

        await expect(page.getByText('Community Forum')).toBeVisible();
    });

    test('categories page renders', async ({ page }) => {
        await page.goto('/categories');

        await expect(page.getByText(/Topics|Categories/i).first()).toBeVisible();
    });

    test('articles page shows empty state or articles', async ({ page }) => {
        await page.goto('/articles');
        await page.waitForLoadState('networkidle');

        // Either articles are shown or empty state
        const hasArticles = await page.locator('.article-card').count();
        const hasEmptyState = await page.locator('.empty-state').count();
        expect(hasArticles + hasEmptyState).toBeGreaterThan(0);
    });
});
