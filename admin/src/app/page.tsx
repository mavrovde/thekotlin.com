'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, UserResponse } from '@/lib/api';

export default function AdminPage() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.replace('/login');
            return;
        }
        api.getMe()
            .then(u => {
                if (u.role !== 'ADMIN') {
                    alert('Access denied. Admin role required.');
                    localStorage.removeItem('admin_token');
                    router.replace('/login');
                    return;
                }
                setUser(u);
                setLoading(false);
            })
            .catch(() => {
                localStorage.removeItem('admin_token');
                router.replace('/login');
            });
    }, [router]);

    if (loading || !user) return null;

    return <AdminLayout user={user} />;
}

function AdminLayout({ user }: { user: UserResponse }) {
    const [page, setPage] = useState('dashboard');
    const router = useRouter();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('admin_token');
        router.replace('/login');
    }, [router]);

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <KotlinDiamondSVG />
                    TheKotlin
                    <span className="admin-badge">Admin</span>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Overview</div>
                        <div className={`sidebar-link ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')}>
                            <span className="icon">📊</span> Dashboard
                        </div>
                    </div>
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Content</div>
                        <div className={`sidebar-link ${page === 'articles' ? 'active' : ''}`} onClick={() => setPage('articles')}>
                            <span className="icon">📝</span> Articles
                        </div>
                        <div className={`sidebar-link ${page === 'categories' ? 'active' : ''}`} onClick={() => setPage('categories')}>
                            <span className="icon">📂</span> Categories
                        </div>
                        <div className={`sidebar-link ${page === 'threads' ? 'active' : ''}`} onClick={() => setPage('threads')}>
                            <span className="icon">💬</span> Forum Threads
                        </div>
                    </div>
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">System</div>
                        <div className={`sidebar-link ${page === 'users' ? 'active' : ''}`} onClick={() => setPage('users')}>
                            <span className="icon">👥</span> Users
                        </div>
                    </div>
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user.displayName || user.username}</div>
                            <div className="sidebar-user-role">{user.role}</div>
                        </div>
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }} onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-topbar">
                    <h1>{page.charAt(0).toUpperCase() + page.slice(1)}</h1>
                </div>
                <div className="admin-content">
                    {page === 'dashboard' && <DashboardPage />}
                    {page === 'articles' && <ArticlesPage />}
                    {page === 'categories' && <CategoriesPage />}
                    {page === 'threads' && <ThreadsPage />}
                    {page === 'users' && <UsersPage />}
                </div>
            </main>
        </div>
    );
}

// ========== Kotlin Diamond SVG ==========
function KotlinDiamondSVG() {
    return (
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <defs>
                <linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7F52FF" />
                    <stop offset="50%" stopColor="#C711E1" />
                    <stop offset="100%" stopColor="#E44857" />
                </linearGradient>
            </defs>
            <path d="M0 0 L100 0 L50 50 L100 100 L0 100 L50 50 L0 0 Z" fill="url(#kg)" />
        </svg>
    );
}

// ========== Dashboard ==========
import { StatsResponse, ArticleListResponse, PageResponse } from '@/lib/api';

function DashboardPage() {
    const [stats, setStats] = useState<StatsResponse | null>(null);

    useEffect(() => {
        api.getStats().then(setStats).catch(() => { });
    }, []);

    return (
        <>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats?.articleCount ?? '—'}</div>
                    <div className="stat-label">Articles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📂</div>
                    <div className="stat-value">{stats?.categoryCount ?? '—'}</div>
                    <div className="stat-label">Categories</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-value">{stats?.threadCount ?? '—'}</div>
                    <div className="stat-label">Forum Threads</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.userCount ?? '—'}</div>
                    <div className="stat-label">Users</div>
                </div>
            </div>
            <div className="data-table-container">
                <div className="data-table-header">
                    <h2>Quick Actions</h2>
                </div>
                <div style={{ padding: 'var(--space-lg)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Use the sidebar to manage articles, categories, users, and forum threads.
                        All operations use the same backend API at <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(127,82,255,0.12)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>:8080</code>.
                    </p>
                </div>
            </div>
        </>
    );
}

// ========== Articles ==========
function ArticlesPage() {
    const [data, setData] = useState<PageResponse<ArticleListResponse> | null>(null);

    useEffect(() => {
        api.getArticles(0, 50).then(setData).catch(() => { });
    }, []);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h2>All Articles</h2>
                <span className="data-table-count">{data?.totalElements ?? 0} total</span>
            </div>
            {data && data.content.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Views</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.content.map(a => (
                            <tr key={a.id}>
                                <td>{a.id}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</td>
                                <td>{a.author.displayName || a.author.username}</td>
                                <td>{a.category?.name ?? '—'}</td>
                                <td>{a.viewCount}</td>
                                <td>{formatDate(a.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    <div className="icon">📝</div>
                    <p>No articles found</p>
                </div>
            )}
        </div>
    );
}

// ========== Categories ==========
import { CategoryResponse } from '@/lib/api';

function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h2>All Categories</h2>
                <span className="data-table-count">{categories.length} total</span>
            </div>
            {categories.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Icon</th>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.icon}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                                <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{c.slug}</code></td>
                                <td>{c.description ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    <div className="icon">📂</div>
                    <p>No categories found</p>
                </div>
            )}
        </div>
    );
}

// ========== Forum Threads ==========
import { ForumThreadResponse } from '@/lib/api';

function ThreadsPage() {
    const [data, setData] = useState<PageResponse<ForumThreadResponse> | null>(null);

    useEffect(() => {
        api.getThreads(0, 50).then(setData).catch(() => { });
    }, []);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h2>Forum Threads</h2>
                <span className="data-table-count">{data?.totalElements ?? 0} total</span>
            </div>
            {data && data.content.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Posts</th>
                            <th>Views</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.content.map(t => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</td>
                                <td>{t.author.displayName || t.author.username}</td>
                                <td>{t.postCount}</td>
                                <td>{t.viewCount}</td>
                                <td>{formatDate(t.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state">
                    <div className="icon">💬</div>
                    <p>No threads found</p>
                </div>
            )}
        </div>
    );
}

// ========== Users (placeholder — no list users endpoint yet) ==========
function UsersPage() {
    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <h2>Users</h2>
            </div>
            <div className="empty-state">
                <div className="icon">👥</div>
                <p>User management API endpoints coming soon.</p>
                <p style={{ fontSize: '0.82rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                    The backend needs a <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(127,82,255,0.12)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>GET /api/admin/users</code> endpoint.
                </p>
            </div>
        </div>
    );
}
