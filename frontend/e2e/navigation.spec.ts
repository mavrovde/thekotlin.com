import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('homepage redirects to /welcome', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL('**/welcome');
        expect(page.url()).toContain('/welcome');
    });

    test('navbar links are present and navigable', async ({ page }) => {
        await page.goto('/welcome');

        // Check all nav links exist
        await expect(page.getByRole('link', { name: 'Welcome' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'News' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Articles' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Forum' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Topics' }).first()).toBeVisible();

        // Navigate to News
        await page.getByRole('link', { name: 'News' }).first().click();
        await page.waitForURL('**/news');
        expect(page.url()).toContain('/news');
    });

    test('footer links are present', async ({ page }) => {
        await page.goto('/welcome');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('footer').getByText('Kotlin Official')).toBeVisible();
    });
});
