'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ArticleListResponse, CategoryResponse, StatsResponse } from '@/lib/api';

export default function HomeContent() {
    const [articles, setArticles] = useState<ArticleListResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [stats, setStats] = useState<StatsResponse | null>(null);

    useEffect(() => {
        api.getArticles(0, 6).then(r => setArticles(r.content)).catch(() => { });
        api.getCategories().then(setCategories).catch(() => { });
        api.getStats().then(setStats).catch(() => { });
    }, []);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <>
            {/* Stats */}
            {stats && (
                <section className="stats-bar">
                    <div className="stat-item">
                        <div className="stat-number">{stats.articleCount}</div>
                        <div className="stat-label">Articles</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.categoryCount}</div>
                        <div className="stat-label">Topics</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.threadCount}</div>
                        <div className="stat-label">Discussions</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{stats.userCount}</div>
                        <div className="stat-label">Members</div>
                    </div>
                </section>
            )}

            {/* Categories */}
            {categories.length > 0 && (
                <section className="welcome-features">
                    <div className="section-header">
                        <h2>Explore Topics</h2>
                        <Link href="/categories" className="btn btn-ghost">
                            View All →
                        </Link>
                    </div>
                    <div className="category-grid">
                        {categories.slice(0, 8).map(cat => (
                            <Link
                                key={cat.id}
                                href={`/articles?category=${cat.slug}`}
                                className="category-card"
                            >
                                <div className="icon">{cat.icon}</div>
                                <div>
                                    <h3>{cat.name}</h3>
                                    <p>{cat.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Latest Articles */}
            {articles.length > 0 && (
                <section>
                    <div className="section-header">
                        <h2>Latest Articles</h2>
                        <Link href="/articles" className="btn btn-ghost">
                            View All →
                        </Link>
                    </div>
                    <div className="article-grid">
                        {articles.map(article => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="article-card"
                            >
                                {article.category && (
                                    <div className="article-card-category">
                                        {article.category.icon} {article.category.name}
                                    </div>
                                )}
                                <h3>{article.title}</h3>
                                <p>{article.summary}</p>
                                <div className="article-card-tags">
                                    {article.tags.slice(0, 3).map(tag => (
                                        <span key={tag.id} className="tag">{tag.name}</span>
                                    ))}
                                </div>
                                <div className="article-card-meta">
                                    <span>{article.author.displayName || article.author.username}</span>
                                    <span>{formatDate(article.createdAt)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
