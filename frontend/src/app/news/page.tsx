'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, NewsResponse } from '@/lib/api';
import KotlinDiamond from '@/components/KotlinDiamond';

export default function NewsPage() {
    const [news, setNews] = useState<NewsResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getNews(0, 50)
            .then(r => setNews(r.content))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <section className="news-header">
                    <KotlinDiamond size={48} className="news-header-diamond" />
                    <h1>Kotlin <span className="gradient-text">News</span></h1>
                    <p>
                        Stay current with the latest Kotlin releases, framework updates,
                        tooling improvements, and community events.
                    </p>
                </section>

                {/* News Timeline */}
                {loading ? (
                    <div className="loading-page"><div className="spinner" /></div>
                ) : news.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📰</div>
                        <h3>No news yet</h3>
                        <p>Check back later for Kotlin ecosystem updates.</p>
                    </div>
                ) : (
                    <section className="news-timeline">
                        {news.map(item => (
                            <article key={item.id} className="news-card glass-card">
                                <div className="news-card-header">
                                    <span
                                        className="news-tag"
                                        style={{ backgroundColor: item.tagColor }}
                                    >
                                        {item.tag}
                                    </span>
                                    <time className="news-date">{formatDate(item.publishedAt)}</time>
                                </div>
                                <h2>{item.title}</h2>
                                <p>{item.summary}</p>
                                {item.sourceUrl && (
                                    <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="news-read-more"
                                    >
                                        Read More →
                                    </a>
                                )}
                            </article>
                        ))}
                    </section>
                )}

                {/* CTA */}
                <section className="news-cta">
                    <div className="glass-card news-cta-card">
                        <h2>Want to contribute news?</h2>
                        <p>Share Kotlin news and updates with the community through our forum.</p>
                        <div className="hero-actions">
                            <Link href="/forum/new" className="btn btn-primary">
                                Share a Post
                            </Link>
                            <Link href="/articles" className="btn btn-secondary">
                                Read Articles
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
