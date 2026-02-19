import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link href="/" className="navbar-logo" style={{ marginBottom: '8px', display: 'inline-flex' }}>
                            <span className="kotlin-mark">K</span>
                            TheKotlin
                        </Link>
                        <p>
                            The professional knowledge base for Kotlin developers and architects.
                            Deep-dive articles, community forum, and curated resources.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4>Content</h4>
                        <ul>
                            <li><Link href="/articles">Articles</Link></li>
                            <li><Link href="/categories">Topics</Link></li>
                            <li><Link href="/forum">Forum</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="https://kotlinlang.org" target="_blank" rel="noopener noreferrer">Kotlin Official</a></li>
                            <li><a href="https://github.com/JetBrains/kotlin" target="_blank" rel="noopener noreferrer">Kotlin GitHub</a></li>
                            <li><a href="https://play.kotlinlang.org" target="_blank" rel="noopener noreferrer">Kotlin Playground</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Community</h4>
                        <ul>
                            <li><Link href="/auth/signup">Join Us</Link></li>
                            <li><Link href="/forum">Discussions</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} TheKotlin.com — Built with ❤️ for Kotlin developers</span>
                    <span>Powered by Next.js & Spring Boot</span>
                </div>
            </div>
        </footer>
    );
}
