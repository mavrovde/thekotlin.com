import type { Metadata } from 'next';
import Link from 'next/link';
import KotlinDiamond from '@/components/KotlinDiamond';

export const metadata: Metadata = {
    title: 'Welcome to TheKotlin.com',
    description: 'Discover the premier knowledge platform for Kotlin developers. Learn coroutines, Multiplatform, Spring Boot, and more with expert articles and community discussions.',
    openGraph: {
        title: 'Welcome to TheKotlin.com',
        description: 'Your journey to mastering Kotlin starts here.',
    },
};

const features = [
    {
        icon: '📝',
        title: 'Expert Articles',
        description: 'Deep-dive technical articles written by experienced Kotlin developers covering coroutines, Multiplatform, architecture patterns, and best practices.',
    },
    {
        icon: '💬',
        title: 'Community Forum',
        description: 'Ask questions, share knowledge, and engage with fellow Kotlin enthusiasts. Get help from experts and contribute your expertise.',
    },
    {
        icon: '📂',
        title: 'Curated Topics',
        description: 'Browse articles and discussions organized by topics — from Android development and Spring Boot to Compose Multiplatform and Kotlin/Native.',
    },
    {
        icon: '🚀',
        title: 'Stay Current',
        description: 'Keep up with the latest Kotlin features, releases, and ecosystem updates. We cover everything from Kotlin 2.x to KMP best practices.',
    },
];

const kotlinReasons = [
    {
        title: 'Concise & Expressive',
        code: `data class User(\n    val name: String,\n    val email: String\n)`,
        description: 'Write less boilerplate and more business logic. Kotlin\'s expressive syntax keeps your code clean and readable.',
    },
    {
        title: 'Null Safety',
        code: `val name: String? = null\nval length = name?.length ?: 0`,
        description: 'Say goodbye to NullPointerExceptions. Kotlin\'s type system catches nullability issues at compile time.',
    },
    {
        title: 'Coroutines',
        code: `suspend fun loadData() {\n    val user = async { getUser() }\n    val posts = async { getPosts() }\n    show(user.await(), posts.await())\n}`,
        description: 'Write asynchronous code that reads like synchronous. Structured concurrency makes concurrent programming simple and safe.',
    },
];

export default function WelcomePage() {
    return (
        <div className="page">
            <div className="container">
                {/* Hero */}
                <section className="hero">
                    <KotlinDiamond size={100} className="hero-diamond" />
                    <h1>
                        Welcome to <span className="gradient-text">TheKotlin</span>
                    </h1>
                    <p>
                        The premier knowledge platform for professional Kotlin developers.
                        Whether you&apos;re just getting started or building complex systems,
                        we&apos;ve got you covered.
                    </p>
                    <div className="hero-actions">
                        <Link href="/articles" className="btn btn-primary">
                            Browse Articles
                        </Link>
                        <Link href="/auth/signup" className="btn btn-secondary">
                            Create Free Account
                        </Link>
                    </div>
                </section>

                {/* Features */}
                <section className="welcome-features">
                    <h2 className="welcome-section-title">What You&apos;ll Find Here</h2>
                    <div className="stats-bar">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card welcome-feature-card">
                                <div className="welcome-feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Why Kotlin */}
                <section className="welcome-why-kotlin">
                    <h2 className="welcome-section-title">Why Kotlin?</h2>
                    <p className="welcome-subtitle">
                        Kotlin is the modern language for building anything — from Android apps to server-side microservices to cross-platform applications.
                    </p>
                    <div className="welcome-reasons">
                        {kotlinReasons.map((r, i) => (
                            <div key={i} className="glass-card welcome-reason-card">
                                <h3>{r.title}</h3>
                                <pre><code>{r.code}</code></pre>
                                <p>{r.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="welcome-cta">
                    <div className="glass-card welcome-cta-card">
                        <KotlinDiamond size={60} className="welcome-cta-diamond" />
                        <h2>Ready to Level Up?</h2>
                        <p>
                            Join thousands of Kotlin developers who trust TheKotlin.com for their professional development.
                        </p>
                        <div className="hero-actions">
                            <Link href="/auth/signup" className="btn btn-primary">
                                Get Started — It&apos;s Free
                            </Link>
                            <Link href="/forum" className="btn btn-secondary">
                                Join the Discussion
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
