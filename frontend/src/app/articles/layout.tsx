import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Articles',
    description: 'Read the latest Kotlin articles, tutorials, and guides from professional developers.',
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
