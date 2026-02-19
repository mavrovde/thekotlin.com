'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, CategoryResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function NewThreadPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    if (!user) {
        router.push('/auth/signin');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || submitting) return;
        setSubmitting(true);
        setError('');
        try {
            const thread = await api.createThread({ title, content, categoryId });
            router.push(`/forum/${thread.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create thread');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '700px' }}>
                <h1 style={{ marginBottom: 'var(--space-xl)' }}>New Discussion</h1>

                {error && (
                    <div className="glass-card" style={{ borderColor: 'var(--danger)', marginBottom: 'var(--space-lg)', color: 'var(--danger)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="What's on your mind?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category (optional)</label>
                        <select
                            className="input-field"
                            value={categoryId || ''}
                            onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                        >
                            <option value="">Select a category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            className="input-field"
                            placeholder="Share your thoughts, questions, or ideas..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={8}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Thread'}
                    </button>
                </form>
            </div>
        </div>
    );
}
