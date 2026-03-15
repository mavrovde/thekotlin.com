import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests (HTTPS Proxy)', () => {
    // We must ignore HTTPS errors because we are using a self-signed certificate for local e2e.
    test.use({ ignoreHTTPSErrors: true });

    const baseURL = 'https://localhost:20443';

    test('frontend should be accessible and return 200 via proxy', async ({ page }) => {
        const response = await page.goto(`${baseURL}/`);
        expect(response?.status()).toBe(200);
        
        // Wait for next.js to render something
        await expect(page.locator('body')).toBeVisible();
    });

    test('backend api should be accessible via proxy', async ({ request }) => {
        // e.g. /api/actuator/health or similar, let's just check /api/ returns 404 or something valid instead of 502
        const response = await request.get(`${baseURL}/api/`);
        
        // As long as it's not a 502 Bad Gateway (meaning proxy failed to connect to backend),
        // we consider the proxying successful.
        expect(response.status()).not.toBe(502);
        expect(response.status()).not.toBe(504);
    });

    test('admin frontend should be accessible via proxy', async ({ page }) => {
        const response = await page.goto(`${baseURL}/admin/`);
        
        // Proxying should succeed, whether it loads the admin page or redirects.
        expect(response?.status()).toBeLessThan(500);

        // Should NOT be Next.js Not Found unless /admin/ doesn't exist, but it's proxied to port 3001.
        expect(response?.status()).not.toBe(404);
    });
});
