import { test, expect } from '@playwright/test';

test.describe('Welcome Page', () => {
    test('renders hero section', async ({ page }) => {
        await page.goto('/welcome');

        await expect(page.getByRole('heading', { name: /Welcome to TheKotlin/i })).toBeVisible();
        await expect(page.getByText('professional knowledge base')).toBeVisible();
    });

    test('Browse Articles button navigates to /articles', async ({ page }) => {
        await page.goto('/welcome');

        await page.getByRole('link', { name: /Browse Articles/i }).click();
        await page.waitForURL('**/articles');
        expect(page.url()).toContain('/articles');
    });

    test('page loads without errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto('/welcome');
        await page.waitForLoadState('networkidle');

        expect(errors).toHaveLength(0);
    });
});
