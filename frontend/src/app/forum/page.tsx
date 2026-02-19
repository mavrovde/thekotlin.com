'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ForumThreadResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ForumPage() {
    const { user } = useAuth();
    const [threads, setThreads] = useState<ForumThreadResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchThreads = async () => {
            setLoading(true);
            try {
                const r = await api.getThreads(page);
                setThreads(r.content);
                setTotalPages(r.totalPages);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [page]);

    const formatDate = (d: string) => {
        const date = new Date(d);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="page">
            <div className="container">
                <div className="section-header">
                    <div>
                        <h1>Community Forum</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                            Discuss Kotlin with fellow developers and architects
                        </p>
                    </div>
                    {user && (
                        <Link href="/forum/new" className="btn btn-primary">
                            + New Thread
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="loading-page"><div className="spinner" /></div>
                ) : threads.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">💬</div>
                        <h3>No discussions yet</h3>
                        <p>Be the first to start a conversation!</p>
                    </div>
                ) : (
                    <div className="thread-list">
                        {threads.map(thread => (
                            <Link
                                key={thread.id}
                                href={`/forum/${thread.id}`}
                                className="thread-item"
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                        {thread.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                                        <h3>{thread.title}</h3>
                                    </div>
                                    <div className="thread-meta">
                                        <span>by {thread.author.displayName || thread.author.username}</span>
                                        {thread.category && (
                                            <span>{thread.category.icon} {thread.category.name}</span>
                                        )}
                                        <span>{formatDate(thread.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="thread-stats">
                                    <span>💬 {thread.postCount}</span>
                                    <span>👁 {thread.viewCount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-2xl)' }}>
                        <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            ← Previous
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Page {page + 1} of {totalPages}
                        </span>
                        <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
