'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;
    }

    if (!user) {
        router.push('/auth/signin');
        return null;
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '700px' }}>
                <div className="profile-header">
                    <div className="profile-avatar">
                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1>{user.displayName || user.username}</h1>
                        <p>@{user.username} · Member since {formatDate(user.createdAt)}</p>
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Account Information</h3>
                    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                        <div>
                            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Username</label>
                            <span>{user.username}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
                            <span>{user.email}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role</label>
                            <span className="tag">{user.role}</span>
                        </div>
                        {user.bio && (
                            <div>
                                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Bio</label>
                                <span>{user.bio}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Quick Links</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        <Link href="/articles" className="btn btn-secondary">📝 My Articles</Link>
                        <Link href="/forum" className="btn btn-secondary">💬 Forum</Link>
                    </div>
                </div>

                <button onClick={logout} className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'rgba(248, 113, 113, 0.3)' }}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
