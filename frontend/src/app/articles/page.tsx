'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ArticleListResponse, CategoryResponse } from '@/lib/api';

export default function ArticlesPage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
            <ArticlesContent />
        </Suspense>
    );
}

function ArticlesContent() {
    const searchParams = useSearchParams();
    const categorySlug = searchParams.get('category');
    const [articles, setArticles] = useState<ArticleListResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const r = searchQuery
                    ? await api.searchArticles(searchQuery, page)
                    : await api.getArticles(page, 12, categorySlug || undefined);
                setArticles(r.content);
                setTotalPages(r.totalPages);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [page, categorySlug, searchQuery]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
    };

    const activeCategory = categories.find(c => c.slug === categorySlug);

    return (
        <div className="page">
            <div className="container">
                <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
                    {activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'All Articles'}
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 'var(--space-2xl)' }}>
                    {activeCategory?.description || 'In-depth articles on Kotlin for professional developers and architects'}
                </p>

                {/* Search */}
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
                        />
                    </form>
                </div>

                {/* Category Filter */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
                    <Link
                        href="/articles"
                        className={`tag ${!categorySlug ? 'active' : ''}`}
                        style={!categorySlug ? { background: 'var(--accent-primary)', color: 'white', borderColor: 'var(--accent-primary)' } : {}}
                    >
                        All
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/articles?category=${cat.slug}`}
                            className="tag"
                            style={categorySlug === cat.slug ? { background: 'var(--accent-primary)', color: 'white', borderColor: 'var(--accent-primary)' } : {}}
                        >
                            {cat.icon} {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="loading-page">
                        <div className="spinner" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📝</div>
                        <h3>No articles found</h3>
                        <p>{searchQuery ? `No results for "${searchQuery}"` : 'Check back later for new content.'}</p>
                    </div>
                ) : (
                    <>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-2xl)' }}>
                                <button
                                    className="btn btn-secondary"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    ← Previous
                                </button>
                                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
