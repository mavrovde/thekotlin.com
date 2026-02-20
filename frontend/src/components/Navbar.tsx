'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import KotlinDiamond from './KotlinDiamond';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path || pathname.startsWith(path + '/') ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    <KotlinDiamond size={32} className="kotlin-diamond" />
                    TheKotlin
                </Link>

                <ul className="navbar-links">
                    <li>
                        <Link href="/articles" className={isActive('/articles')}>
                            Articles
                        </Link>
                    </li>
                    <li>
                        <Link href="/forum" className={isActive('/forum')}>
                            Forum
                        </Link>
                    </li>
                    <li>
                        <Link href="/categories" className={isActive('/categories')}>
                            Topics
                        </Link>
                    </li>
                </ul>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link href="/profile" className="btn btn-ghost">
                                {user.displayName || user.username}
                            </Link>
                            <button onClick={logout} className="btn btn-secondary">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" className="btn btn-ghost">
                                Sign In
                            </Link>
                            <Link href="/auth/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
