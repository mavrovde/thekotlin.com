'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, CategoryResponse } from '@/lib/api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>Kotlin Topics</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 'var(--space-2xl)', maxWidth: '500px', margin: '0 auto var(--space-2xl)' }}>
                    Browse articles by topic area — from language fundamentals to advanced architecture patterns
                </p>

                <div className="category-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {categories.map(cat => (
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
            </div>
        </div>
    );
}
