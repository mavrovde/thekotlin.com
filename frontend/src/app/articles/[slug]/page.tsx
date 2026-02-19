'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ArticleResponse } from '@/lib/api';

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [article, setArticle] = useState<ArticleResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        api.getArticle(slug)
            .then(setArticle)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [slug]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const renderMarkdown = (content: string) => {
        // Simple Markdown-to-HTML conversion for code blocks, headers, lists, bold, links
        let html = content
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Unordered lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Paragraphs (double newlines)
            .replace(/\n\n/g, '</p><p>')
            // Single newlines in non-pre context
            .replace(/\n/g, '<br/>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/(<li>.*?<\/li>(?:<br\/>)?)+/g, match => {
            return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
        });

        return '<p>' + html + '</p>';
    };

    if (loading) {
        return (
            <div className="page">
                <div className="loading-page"><div className="spinner" /></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="page">
                <div className="container">
                    <div className="empty-state">
                        <div className="icon">📄</div>
                        <h3>Article not found</h3>
                        <p>{error || 'The article you\'re looking for doesn\'t exist.'}</p>
                        <Link href="/articles" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                            Back to Articles
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="article-detail">
                    <div className="article-detail-header">
                        {article.category && (
                            <Link
                                href={`/articles?category=${article.category.slug}`}
                                className="article-card-category"
                                style={{ display: 'inline-block', marginBottom: 'var(--space-md)' }}
                            >
                                {article.category.icon} {article.category.name}
                            </Link>
                        )}
                        <h1>{article.title}</h1>
                        {article.summary && (
                            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>
                                {article.summary}
                            </p>
                        )}
                        <div className="article-detail-meta">
                            <span>By {article.author.displayName || article.author.username}</span>
                            <span>{formatDate(article.createdAt)}</span>
                            <span>{article.viewCount} views</span>
                        </div>
                        <div className="article-card-tags">
                            {article.tags.map(tag => (
                                <span key={tag.id} className="tag">{tag.name}</span>
                            ))}
                        </div>
                    </div>

                    <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                    />

                    <div style={{ marginTop: 'var(--space-3xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--border-color)' }}>
                        <Link href="/articles" className="btn btn-secondary">
                            ← Back to Articles
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
