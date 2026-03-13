import sitemap from '@/app/sitemap';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('sitemap', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('generates static routes and skips dynamic routes if fetch fails', async () => {
        mockFetch.mockRejectedValue(new Error('Fetch failed'));

        const result = await sitemap();

        // Static routes count is 7
        expect(result).toHaveLength(7);
        expect(result[0].url).toBe('https://thekotlin.com');
        expect(result[1].url).toContain('/welcome');
        expect(result[5].url).toContain('/auth/signin');
    });

    it('handles non-ok response for dynamic routes', async () => {
        mockFetch.mockResolvedValue({ ok: false });

        const result = await sitemap();

        // Static routes only
        expect(result).toHaveLength(7);
    });

    it('includes dynamic articles and categories', async () => {
        mockFetch.mockImplementation(async (url: string) => {
            if (url.includes('/articles')) {
                return {
                    ok: true,
                    json: async () => ({
                        content: [
                            { slug: 'article-1', updatedAt: '2023-01-01T00:00:00Z' },
                            { slug: 'article-2', updatedAt: null }
                        ]
                    })
                };
            }
            if (url.includes('/categories')) {
                return {
                    ok: true,
                    json: async () => ([
                        { slug: 'category-1' }
                    ])
                };
            }
            return { ok: false };
        });

        const result = await sitemap();

        // 7 static + 2 articles + 1 category = 10 routes
        expect(result).toHaveLength(10);
        
        const urls = result.map(r => r.url);
        expect(urls).toContain('https://thekotlin.com/articles/article-1');
        expect(urls).toContain('https://thekotlin.com/articles/article-2');
        expect(urls).toContain('https://thekotlin.com/articles?category=category-1');
    });

    it('uses standard URL when NEXT_PUBLIC_SITE_URL is not provided', async () => {
        delete process.env.NEXT_PUBLIC_SITE_URL;
        mockFetch.mockRejectedValue(new Error('Fetch failed')); // skip dynamics

        const result = await sitemap();
        expect(result[0].url).toBe('https://thekotlin.com');
    });
});
