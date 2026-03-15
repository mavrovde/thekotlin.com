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
        const nav = page.locator('nav');
        await expect(nav.getByRole('link', { name: 'Welcome' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'News' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Articles' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Forum' })).toBeVisible();
        await expect(nav.getByRole('link', { name: 'Topics' })).toBeVisible();

        // Navigate to News
        await nav.getByRole('link', { name: 'News' }).click();
        await page.waitForURL('**/news');
        expect(page.url()).toContain('/news');
    });

    test('footer links are present', async ({ page }) => {
        await page.goto('/welcome');
        await page.locator('footer').scrollIntoViewIfNeeded();

        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('footer').getByText('Kotlin Official')).toBeVisible();
    });
});
