import { MetadataRoute } from 'next';
import { config } from '@/config';

const siteUrl = config.siteUrl;

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/profile/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
