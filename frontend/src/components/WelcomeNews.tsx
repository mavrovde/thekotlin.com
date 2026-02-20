'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, NewsResponse } from '@/lib/api';

export default function WelcomeNews() {
    const [news, setNews] = useState<NewsResponse[]>([]);

    useEffect(() => {
        api.getNews(0, 4)
            .then(r => setNews(r.content))
            .catch(() => { });
    }, []);

    if (news.length === 0) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return (
        <section className="welcome-news">
            <div className="section-header">
                <h2>Latest <span className="gradient-text">News</span></h2>
                <Link href="/news" className="btn btn-ghost">
                    All News →
                </Link>
            </div>
            <div className="news-timeline welcome-news-timeline">
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
                        <h3>{item.title}</h3>
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
            </div>
        </section>
    );
}
