import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Forum',
    description: 'Join the discussion with Kotlin developers and architects in our community forum.',
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
