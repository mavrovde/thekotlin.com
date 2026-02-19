'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ForumThreadDetailResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ThreadDetailPage() {
    const params = useParams();
    const threadId = Number(params.id);
    const { user } = useAuth();
    const [thread, setThread] = useState<ForumThreadDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    useEffect(() => {
        if (!threadId) return;
        api.getThread(threadId)
            .then(setThread)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [threadId]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || replying) return;
        setReplying(true);
        try {
            await api.createPost(threadId, { content: replyContent });
            setReplyContent('');
            // Refresh thread
            const updated = await api.getThread(threadId);
            setThread(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setReplying(false);
        }
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) {
        return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;
    }

    if (!thread) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="icon">💬</div>
                        <h3>Thread not found</h3>
                        <Link href="/forum" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                            Back to Forum
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <Link href="/forum" className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>
                    ← Back to Forum
                </Link>

                <div style={{ marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        {thread.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                        {thread.isLocked && <span className="pinned-badge" style={{ background: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)' }}>🔒 Locked</span>}
                    </div>
                    <h1>{thread.title}</h1>
                    <div className="thread-meta" style={{ marginTop: 'var(--space-sm)' }}>
                        <span>Started by {thread.author.displayName || thread.author.username}</span>
                        {thread.category && <span>{thread.category.icon} {thread.category.name}</span>}
                        <span>{formatDate(thread.createdAt)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {thread.posts.map(post => (
                        <div key={post.id} className="post-item">
                            <div className="post-header">
                                <span className="post-author">{post.author.displayName || post.author.username}</span>
                                <span className="post-date">{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="post-body">{post.content}</div>
                        </div>
                    ))}
                </div>

                {/* Reply form */}
                {user && !thread.isLocked && (
                    <form onSubmit={handleReply} style={{ marginTop: 'var(--space-2xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Reply</h3>
                        <div className="form-group">
                            <textarea
                                className="input-field"
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                rows={5}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={replying}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            {replying ? 'Posting...' : 'Post Reply'}
                        </button>
                    </form>
                )}

                {!user && (
                    <div className="glass-card" style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                            Sign in to join the discussion
                        </p>
                        <Link href="/auth/signin" className="btn btn-primary">Sign In</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
