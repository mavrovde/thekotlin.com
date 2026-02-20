import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thekotlin.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ArticleSlug {
    slug: string;
    updatedAt: string;
}

interface CategorySlug {
    slug: string;
}

async function fetchJson<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${siteUrl}/welcome`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/forum`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${siteUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/auth/signin`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${siteUrl}/auth/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic article pages
    const articles = await fetchJson<{ content: ArticleSlug[] }>(`${apiUrl}/articles?page=0&size=1000`);
    if (articles?.content) {
        for (const article of articles.content) {
            entries.push({
                url: `${siteUrl}/articles/${article.slug}`,
                lastModified: new Date(article.updatedAt || new Date()),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    }

    // Dynamic category pages
    const categories = await fetchJson<CategorySlug[]>(`${apiUrl}/categories`);
    if (categories) {
        for (const cat of categories) {
            entries.push({
                url: `${siteUrl}/articles?category=${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    }

    return entries;
}
