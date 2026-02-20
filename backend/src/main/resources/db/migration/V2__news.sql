-- News articles table
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    tag VARCHAR(50) NOT NULL DEFAULT 'General',
    tag_color VARCHAR(7) NOT NULL DEFAULT '#7F52FF',
    source_url VARCHAR(500),
    author_id BIGINT REFERENCES users(id),
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_news_tag ON news(tag);
CREATE INDEX idx_news_slug ON news(slug);

-- Seed some initial news
INSERT INTO news (title, slug, summary, tag, tag_color, source_url, published_at) VALUES
('Kotlin 2.2 Released', 'kotlin-2-2-released',
 'Kotlin 2.2 introduces improved K2 compiler performance, new language features for data classes, and enhanced multiplatform support with better iOS interop.',
 'Release', '#7F52FF', 'https://kotlinlang.org/docs/whatsnew22.html', '2026-02-15 10:00:00'),

('Compose Multiplatform 1.8 Stable', 'compose-multiplatform-1-8-stable',
 'JetBrains releases Compose Multiplatform 1.8 with native iOS performance improvements, Material 3 adaptive layouts, and web target now in beta.',
 'Compose', '#4285F4', 'https://www.jetbrains.com/lp/compose-multiplatform/', '2026-02-10 09:00:00'),

('Spring Boot 3.4 with Kotlin DSL Enhancements', 'spring-boot-3-4-kotlin-dsl',
 'Spring Boot 3.4 deepens Kotlin integration with improved coroutine support in WebFlux, native bean definitions via Kotlin DSL, and virtual thread compatibility.',
 'Server', '#6DB33F', 'https://spring.io/blog', '2026-01-28 14:00:00'),

('Ktor 3.1 — Performance and DX Improvements', 'ktor-3-1-performance-dx',
 'Ktor 3.1 brings HTTP/3 experimental support, improved routing DSL, automatic OpenAPI generation, and significant startup time improvements.',
 'Ktor', '#E44857', 'https://ktor.io/docs/welcome.html', '2026-01-20 11:00:00'),

('Android Studio Narwhal Announced', 'android-studio-narwhal',
 'Google announces Android Studio Narwhal with AI-powered Kotlin code completion, Compose live edit 2.0, and integrated KMP project templates.',
 'Android', '#3DDC84', 'https://developer.android.com/studio', '2026-01-15 16:00:00'),

('KotlinConf 2026 Dates Announced', 'kotlinconf-2026-dates',
 'JetBrains announces KotlinConf 2026 in Amsterdam. Call for papers is now open with topics ranging from KMP to server-side Kotlin and Compose.',
 'Community', '#F7931E', 'https://kotlinconf.com', '2025-12-20 12:00:00'),

('Amper Build Tool Reaches Beta', 'amper-build-tool-beta',
 'JetBrains'' Amper build tool, designed as a Gradle alternative for Kotlin projects, reaches beta with multiplatform support and simplified DSL.',
 'Tooling', '#9C27B0', 'https://github.com/JetBrains/amper', '2025-12-10 10:00:00'),

('Kotlin Multiplatform Production-Ready for iOS', 'kmp-production-ready-ios',
 'JetBrains officially declares Kotlin Multiplatform stable for iOS targets, with memory management improvements and seamless Swift interop.',
 'KMP', '#FF6F00', 'https://kotlinlang.org/docs/multiplatform.html', '2025-11-25 09:00:00');
