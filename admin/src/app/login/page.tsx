'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.login({ username, password });
            if (res.user.role !== 'ADMIN') {
                setError('Access denied. Admin role required.');
                return;
            }
            localStorage.setItem('admin_token', res.token);
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-page">
            <div className="admin-auth-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
                        <defs>
                            <linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7F52FF" />
                                <stop offset="50%" stopColor="#C711E1" />
                                <stop offset="100%" stopColor="#E44857" />
                            </linearGradient>
                        </defs>
                        <path d="M0 0 L100 0 L50 50 L100 100 L0 100 L50 50 L0 0 Z" fill="url(#kg)" />
                    </svg>
                    <div>
                        <h1>Admin Panel</h1>
                        <p className="subtitle" style={{ marginBottom: 0 }}>TheKotlin.com administration</p>
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="admin-auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="admin"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In as Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
