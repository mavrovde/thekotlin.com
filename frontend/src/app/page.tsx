'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ArticleListResponse, CategoryResponse, StatsResponse } from '@/lib/api';
import KotlinDiamond from '@/components/KotlinDiamond';

export default function HomePage() {
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
    <div className="page">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <KotlinDiamond size={120} className="hero-diamond" />
          <h1>
            Master <span className="gradient-text">Kotlin</span>
            <br />
            Like a Pro
          </h1>
          <p>
            The definitive knowledge base for professional Kotlin developers and architects.
            Deep-dive articles, expert discussions, and curated resources.
          </p>
          <div className="hero-actions">
            <Link href="/articles" className="btn btn-primary">
              Explore Articles
            </Link>
            <Link href="/forum" className="btn btn-secondary">
              Join the Forum
            </Link>
          </div>

          {/* Code snippet showcase */}
          <div className="hero-code">
            <pre>
              <code>
                <span className="code-line-number">1</span><span className="code-keyword">suspend fun</span> <span className="code-function">fetchArticles</span>(): <span className="code-type">List</span>&lt;<span className="code-type">Article</span>&gt; = <span className="code-function">coroutineScope</span> &#123;{'\n'}
                <span className="code-line-number">2</span>    <span className="code-keyword">val</span> featured = <span className="code-function">async</span> &#123; api.<span className="code-function">getFeatured</span>() &#125;{'\n'}
                <span className="code-line-number">3</span>    <span className="code-keyword">val</span> latest = <span className="code-function">async</span> &#123; api.<span className="code-function">getLatest</span>() &#125;{'\n'}
                <span className="code-line-number">4</span>    featured.<span className="code-function">await</span>() + latest.<span className="code-function">await</span>(){'\n'}
                <span className="code-line-number">5</span>&#125;
              </code>
            </pre>
          </div>
        </section>

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
          <section style={{ marginBottom: 'var(--space-3xl)' }}>
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
      </div>
    </div>
  );
}
