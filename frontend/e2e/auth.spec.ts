import { test, expect } from '@playwright/test';

test.describe('Auth Pages', () => {
    test('sign-in page renders form', async ({ page }) => {
        await page.goto('/auth/signin');

        await expect(page.getByText('Welcome Back')).toBeVisible();
        await expect(page.getByPlaceholder('your-username')).toBeVisible();
        await expect(page.getByPlaceholder('••••••••')).toBeVisible();
        await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('sign-up page renders form', async ({ page }) => {
        await page.goto('/auth/signup');

        await expect(page.getByText('Create Account')).toBeVisible();
        await expect(page.getByPlaceholder('your-username')).toBeVisible();
    });

    test('OAuth buttons are present on sign-in', async ({ page }) => {
        await page.goto('/auth/signin');

        await expect(page.getByText('Sign in with Google')).toBeVisible();
        await expect(page.getByText('Sign in with Apple')).toBeVisible();
    });

    test('sign-in has link to sign-up', async ({ page }) => {
        await page.goto('/auth/signin');

        const signUpLink = page.getByRole('link', { name: 'Sign Up' });
        await expect(signUpLink).toBeVisible();
        await signUpLink.click();
        await page.waitForURL('**/auth/signup');
        expect(page.url()).toContain('/auth/signup');
    });
});
