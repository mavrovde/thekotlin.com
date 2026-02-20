import type { Metadata } from 'next';
import Link from 'next/link';
import KotlinDiamond from '@/components/KotlinDiamond';
import HomeContent from '@/components/HomeContent';

export const metadata: Metadata = {
  title: 'TheKotlin.com — Master Kotlin Like a Pro',
  description: 'The definitive knowledge base for professional Kotlin developers. Deep-dive articles on coroutines, Multiplatform, Spring Boot, Compose, and architecture patterns.',
  openGraph: {
    title: 'TheKotlin.com — Master Kotlin Like a Pro',
    description: 'Deep-dive articles, community forum, and expert resources for Kotlin developers.',
  },
};

export default function HomePage() {
  return (
    <div className="page">
      <div className="container">
        {/* Hero (Server-rendered for SEO) */}
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

        {/* Dynamic content loaded on client */}
        <HomeContent />
      </div>
    </div>
  );
}
