import { Metadata } from 'next';
import { api } from '@/lib/api';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const article = await api.getArticle(params.slug);
        return {
            title: article.title,
            description: article.summary || `Read ${article.title} on TheKotlin.com`,
            openGraph: {
                title: article.title,
                description: article.summary || undefined,
                type: 'article',
                authors: [article.author.displayName || article.author.username],
                publishedTime: article.createdAt,
            }
        };
    } catch {
        return { title: 'Article Not Found' };
    }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
