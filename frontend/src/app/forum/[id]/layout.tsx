import { Metadata } from 'next';
import { api } from '@/lib/api';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    try {
        const threadId = Number(params.id);
        if (isNaN(threadId)) throw new Error('Invalid ID');
        const thread = await api.getThread(threadId);
        return {
            title: `${thread.title} | Forum`,
            description: `Join the discussion on "${thread.title}" in TheKotlin.com community forum.`,
            openGraph: {
                title: thread.title,
                description: `Discuss "${thread.title}" with Kotlin developers.`,
                type: 'article',
                publishedTime: thread.createdAt,
            }
        };
    } catch {
        return { title: 'Thread Not Found' };
    }
}

export default function ForumThreadLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
