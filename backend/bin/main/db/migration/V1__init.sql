-- =============================================
-- TheKotlin.com — Database Schema
-- =============================================

-- Users
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100),
    bio           TEXT,
    avatar_url    VARCHAR(500),
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(50),
    sort_order  INT NOT NULL DEFAULT 0
);

-- Tags
CREATE TABLE tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
);

-- Articles
CREATE TABLE articles (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(300) NOT NULL,
    slug          VARCHAR(300) NOT NULL UNIQUE,
    summary       TEXT,
    content       TEXT         NOT NULL,
    author_id     BIGINT       NOT NULL REFERENCES users(id),
    category_id   BIGINT       REFERENCES categories(id),
    status        VARCHAR(20)  NOT NULL DEFAULT 'PUBLISHED',
    view_count    INT          NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Article-Tags junction
CREATE TABLE article_tags (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Forum Threads
CREATE TABLE forum_threads (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(300) NOT NULL,
    author_id  BIGINT       NOT NULL REFERENCES users(id),
    category_id BIGINT      REFERENCES categories(id),
    is_pinned  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_locked  BOOLEAN      NOT NULL DEFAULT FALSE,
    view_count INT          NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Forum Posts
CREATE TABLE forum_posts (
    id        BIGSERIAL PRIMARY KEY,
    content   TEXT    NOT NULL,
    author_id BIGINT  NOT NULL REFERENCES users(id),
    thread_id BIGINT  NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    parent_id BIGINT  REFERENCES forum_posts(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Full-text search on articles
CREATE INDEX idx_articles_search ON articles USING GIN (search_vector);
CREATE INDEX idx_articles_slug ON articles (slug);
CREATE INDEX idx_articles_category ON articles (category_id);
CREATE INDEX idx_articles_author ON articles (author_id);
CREATE INDEX idx_articles_status ON articles (status);
CREATE INDEX idx_articles_created ON articles (created_at DESC);

-- Forum indexes
CREATE INDEX idx_threads_category ON forum_threads (category_id);
CREATE INDEX idx_threads_created ON forum_threads (created_at DESC);
CREATE INDEX idx_posts_thread ON forum_posts (thread_id);

-- Auto-update search_vector trigger
CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.summary, '') || ' ' || COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_search_vector_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

-- =============================================
-- Seed Data
-- =============================================

-- Admin user (password: admin123)
INSERT INTO users (username, email, password_hash, display_name, role, bio) VALUES
('admin', 'admin@thekotlin.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'ADMIN', 'Platform administrator');

-- Sample user (password: kotlin123)
INSERT INTO users (username, email, password_hash, display_name, role, bio) VALUES
('kotlindev', 'dev@thekotlin.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kotlin Developer', 'AUTHOR', 'Passionate Kotlin developer and architect');

-- Categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Language Basics',     'language-basics',     'Fundamentals of the Kotlin language',                    '📖', 1),
('Coroutines',          'coroutines',          'Asynchronous programming with Kotlin Coroutines',        '⚡', 2),
('Multiplatform',       'multiplatform',       'Kotlin Multiplatform Mobile and other targets',          '🌍', 3),
('Spring & Backend',    'spring-backend',      'Server-side development with Spring Boot and Ktor',      '🖥️', 4),
('Android',             'android',             'Android development with Kotlin and Jetpack Compose',    '📱', 5),
('Architecture',        'architecture',        'Design patterns, clean architecture, and best practices','🏗️', 6),
('Testing',             'testing',             'Unit testing, integration testing, and TDD in Kotlin',   '🧪', 7),
('Tooling & Ecosystem', 'tooling-ecosystem',   'Build tools, IDE support, and the Kotlin ecosystem',     '🔧', 8);

-- Tags
INSERT INTO tags (name, slug) VALUES
('kotlin',       'kotlin'),
('coroutines',   'coroutines'),
('flow',         'flow'),
('compose',      'compose'),
('spring-boot',  'spring-boot'),
('ktor',         'ktor'),
('multiplatform','multiplatform'),
('android',      'android'),
('testing',      'testing'),
('architecture', 'architecture'),
('dsl',          'dsl'),
('functional',   'functional'),
('beginner',     'beginner'),
('advanced',     'advanced');

-- Sample Articles
INSERT INTO articles (title, slug, summary, content, author_id, category_id, status) VALUES
(
    'Understanding Kotlin Coroutines: A Deep Dive',
    'understanding-kotlin-coroutines-deep-dive',
    'Master Kotlin coroutines from fundamentals to advanced patterns. Learn about structured concurrency, dispatchers, and real-world usage.',
    '## Introduction

Kotlin coroutines represent one of the most powerful features of the Kotlin programming language. They provide a way to write asynchronous, non-blocking code that is both readable and maintainable.

## What Are Coroutines?

A coroutine is an instance of a suspendable computation. It is conceptually similar to a thread, in the sense that it takes a block of code to run that works concurrently with the rest of the code. However, a coroutine is not bound to any particular thread.

```kotlin
import kotlinx.coroutines.*

fun main() = runBlocking {
    launch {
        delay(1000L)
        println("World!")
    }
    println("Hello")
}
```

## Structured Concurrency

Kotlin enforces structured concurrency, meaning that new coroutines can only be launched in a specific `CoroutineScope` which delimits the lifetime of the coroutine.

```kotlin
suspend fun fetchUserData(): UserData = coroutineScope {
    val profile = async { api.fetchProfile() }
    val posts = async { api.fetchPosts() }
    UserData(profile.await(), posts.await())
}
```

## Dispatchers

Coroutine dispatchers determine what thread or threads the corresponding coroutine uses for its execution:

- **Dispatchers.Main** — UI thread on Android
- **Dispatchers.IO** — Optimized for I/O operations
- **Dispatchers.Default** — CPU-intensive work
- **Dispatchers.Unconfined** — Not confined to any specific thread

## Flow: Reactive Streams in Kotlin

Kotlin Flow is a type that can emit multiple values sequentially, as opposed to suspend functions that return only a single value.

```kotlin
fun fetchNews(): Flow<Article> = flow {
    val articles = api.fetchLatestNews()
    articles.forEach { article ->
        emit(article)
        delay(1000)
    }
}
```

## Best Practices

1. **Always use structured concurrency** — Avoid `GlobalScope`
2. **Handle exceptions properly** — Use `CoroutineExceptionHandler`
3. **Choose the right dispatcher** — Match it to your workload
4. **Cancel when appropriate** — Respect the lifecycle
5. **Test your coroutines** — Use `runTest` and `TestDispatcher`

## Conclusion

Kotlin coroutines bring a paradigm shift to asynchronous programming by making concurrent code almost as simple as sequential code. Mastering them is essential for any professional Kotlin developer.',
    2, 2, 'PUBLISHED'
),
(
    'Clean Architecture in Kotlin: Building Scalable Applications',
    'clean-architecture-kotlin-scalable-applications',
    'Learn how to structure your Kotlin applications using Clean Architecture principles for maximum testability and maintainability.',
    '## Introduction

Clean Architecture, introduced by Robert C. Martin, provides a way to organize code so that it encapsulates the business logic but keeps it separate from the delivery mechanism.

## The Dependency Rule

The fundamental rule is that source code dependencies can only point inwards. Nothing in an inner circle can know anything about something in an outer circle.

```
Entities → Use Cases → Interface Adapters → Frameworks & Drivers
```

## Domain Layer

The innermost layer contains enterprise business rules:

```kotlin
// Entity
data class Article(
    val id: Long,
    val title: String,
    val content: String,
    val author: Author,
    val tags: List<Tag>,
    val publishedAt: Instant
)

// Use Case
class GetArticleUseCase(
    private val articleRepository: ArticleRepository
) {
    suspend operator fun invoke(slug: String): Result<Article> {
        return articleRepository.findBySlug(slug)
            ?.let { Result.success(it) }
            ?: Result.failure(ArticleNotFoundException(slug))
    }
}
```

## Data Layer

Implements the repository interfaces defined in the domain:

```kotlin
class ArticleRepositoryImpl(
    private val articleDao: ArticleDao,
    private val mapper: ArticleMapper
) : ArticleRepository {

    override suspend fun findBySlug(slug: String): Article? {
        return articleDao.findBySlug(slug)?.let { mapper.toDomain(it) }
    }

    override suspend fun search(query: String): List<Article> {
        return articleDao.fullTextSearch(query).map { mapper.toDomain(it) }
    }
}
```

## Presentation Layer

Uses ViewModels to bridge the domain and UI:

```kotlin
class ArticleViewModel(
    private val getArticle: GetArticleUseCase
) : ViewModel() {

    private val _state = MutableStateFlow<ArticleState>(ArticleState.Loading)
    val state: StateFlow<ArticleState> = _state.asStateFlow()

    fun loadArticle(slug: String) {
        viewModelScope.launch {
            getArticle(slug)
                .onSuccess { _state.value = ArticleState.Loaded(it) }
                .onFailure { _state.value = ArticleState.Error(it.message) }
        }
    }
}
```

## Benefits

- **Independent of frameworks** — The architecture does not depend on the existence of some library
- **Testable** — Business rules can be tested without UI, database, or any external element
- **Independent of UI** — The UI can change without changing the rest of the system
- **Independent of database** — Your business rules are not bound to a specific DB

## Conclusion

Clean Architecture in Kotlin leads to codebases that are easier to test, maintain, and evolve. The initial investment in structuring your code pays dividends as the project grows.',
    2, 6, 'PUBLISHED'
),
(
    'Kotlin Multiplatform: Share Code Between Android and iOS',
    'kotlin-multiplatform-share-code-android-ios',
    'A comprehensive guide to Kotlin Multiplatform Mobile (KMM) — sharing business logic between Android and iOS while keeping native UIs.',
    '## Introduction

Kotlin Multiplatform (KMP) allows you to share code between different platforms while keeping the best parts of native development.

## Project Setup

A typical KMM project structure:

```
shared/
├── commonMain/     # Shared Kotlin code
├── androidMain/    # Android-specific implementations
└── iosMain/        # iOS-specific implementations
```

## Expect/Actual Pattern

The expect/actual mechanism allows you to define expected declarations in common code and provide platform-specific implementations:

```kotlin
// commonMain
expect class PlatformLogger() {
    fun log(message: String)
}

// androidMain
actual class PlatformLogger {
    actual fun log(message: String) {
        Log.d("KMM", message)
    }
}

// iosMain
actual class PlatformLogger {
    actual fun log(message: String) {
        NSLog(message)
    }
}
```

## Shared Data Layer

One of the most impactful areas for code sharing:

```kotlin
// commonMain
class ArticleRepository(
    private val api: ArticleApi,
    private val cache: ArticleCache
) {
    suspend fun getArticles(): List<Article> {
        return try {
            val articles = api.fetchArticles()
            cache.saveArticles(articles)
            articles
        } catch (e: Exception) {
            cache.getArticles()
        }
    }
}
```

## Networking with Ktor

Ktor client works seamlessly in KMP projects:

```kotlin
val httpClient = HttpClient {
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            prettyPrint = true
        })
    }
}
```

## Best Practices

1. **Start with the data layer** — Highest ROI for code sharing
2. **Use interfaces** — Define platform contracts in common code
3. **Leverage Kotlin serialization** — Cross-platform data parsing
4. **Test common code thoroughly** — It runs everywhere!

## Conclusion

Kotlin Multiplatform is production-ready and allows teams to maintain a single source of truth for business logic while delivering native experiences on each platform.',
    2, 3, 'PUBLISHED'
),
(
    'Getting Started with Kotlin: A Guide for Java Developers',
    'getting-started-kotlin-guide-java-developers',
    'Transitioning from Java to Kotlin? This comprehensive guide covers everything you need to know to start writing idiomatic Kotlin code.',
    '## Why Kotlin?

Kotlin is a modern, concise, and safe programming language that runs on the JVM. It is fully interoperable with Java and has become the preferred language for Android development.

## Key Differences from Java

### Null Safety

Kotlin''s type system distinguishes between nullable and non-nullable types:

```kotlin
var name: String = "Kotlin"    // Cannot be null
var nullable: String? = null    // Can be null

// Safe calls
val length = nullable?.length

// Elvis operator
val len = nullable?.length ?: 0
```

### Data Classes

No more boilerplate for POJOs:

```kotlin
data class User(
    val id: Long,
    val name: String,
    val email: String
)
// Automatically generates equals(), hashCode(), toString(), copy()
```

### Extension Functions

Add functionality to existing classes:

```kotlin
fun String.isValidEmail(): Boolean {
    return matches(Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"))
}

// Usage
"user@example.com".isValidEmail() // true
```

### When Expression

A powerful replacement for switch:

```kotlin
fun describe(obj: Any): String = when (obj) {
    is Int -> "Integer: $obj"
    is String -> "String of length ${obj.length}"
    is List<*> -> "List of size ${obj.size}"
    else -> "Unknown"
}
```

## Smart Casts

The compiler tracks type checks:

```kotlin
fun process(value: Any) {
    if (value is String) {
        // value is automatically cast to String
        println(value.uppercase())
    }
}
```

## Conclusion

Kotlin offers a more expressive and safer alternative to Java while maintaining full interoperability. Start using it today in your existing Java projects!',
    2, 1, 'PUBLISHED'
),
(
    'Testing Kotlin Code: From Unit Tests to Integration Tests',
    'testing-kotlin-code-unit-integration-tests',
    'A practical guide to testing Kotlin applications using JUnit 5, MockK, and Kotest. Learn TDD practices tailored for Kotlin.',
    '## Introduction

Testing is a critical part of professional software development. Kotlin provides excellent support for writing clean, expressive tests.

## JUnit 5 with Kotlin

```kotlin
class CalculatorTest {

    private val calculator = Calculator()

    @Test
    fun `should add two numbers correctly`() {
        val result = calculator.add(2, 3)
        assertEquals(5, result)
    }

    @Test
    fun `should throw exception for division by zero`() {
        assertThrows<ArithmeticException> {
            calculator.divide(10, 0)
        }
    }
}
```

## MockK — Mocking for Kotlin

MockK is a mocking library designed specifically for Kotlin:

```kotlin
class UserServiceTest {

    private val repository = mockk<UserRepository>()
    private val service = UserService(repository)

    @Test
    fun `should find user by id`() {
        val user = User(1, "kotlin_dev", "dev@kotlin.com")
        every { repository.findById(1) } returns Optional.of(user)

        val result = service.getUser(1)

        assertEquals("kotlin_dev", result.username)
        verify { repository.findById(1) }
    }
}
```

## Testing Coroutines

```kotlin
class ArticleRepositoryTest {

    @Test
    fun `should fetch articles from API`() = runTest {
        val api = mockk<ArticleApi>()
        val repo = ArticleRepository(api)

        coEvery { api.fetchArticles() } returns listOf(
            Article("Kotlin Basics", "kotlin-basics")
        )

        val articles = repo.getArticles()

        assertEquals(1, articles.size)
        assertEquals("Kotlin Basics", articles[0].title)
    }
}
```

## Best Practices

1. **Use descriptive test names** — Kotlin allows backtick function names
2. **Follow AAA pattern** — Arrange, Act, Assert
3. **Test behavior, not implementation** — Focus on what, not how
4. **Mock external dependencies** — Use MockK for idiomatic Kotlin mocking
5. **Test edge cases** — Null values, empty collections, boundary conditions

## Conclusion

Kotlin makes testing a pleasure with its concise syntax and powerful libraries. Invest in testing to build reliable, maintainable applications.',
    2, 7, 'PUBLISHED'
);

-- Link articles to tags
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 14),   -- Coroutines article
(2, 1), (2, 10), (2, 14),           -- Architecture article
(3, 1), (3, 7), (3, 8),             -- Multiplatform article
(4, 1), (4, 13),                     -- Getting Started article
(5, 1), (5, 9), (5, 14);            -- Testing article

-- Sample Forum Threads
INSERT INTO forum_threads (title, author_id, category_id) VALUES
('Best practices for error handling in coroutines?', 2, 2),
('Migrating large Java project to Kotlin — tips?', 2, 1),
('KMP vs Flutter for cross-platform development', 2, 3),
('Recommended architecture for Kotlin Spring Boot microservices', 2, 4);

-- Sample Forum Posts
INSERT INTO forum_posts (content, author_id, thread_id) VALUES
('I''ve been using `CoroutineExceptionHandler` but I''m not sure about the best way to handle errors in nested coroutines. Does anyone have a pattern they recommend for production apps?', 2, 1),
('We''ve been migrating our 500k LOC Java codebase to Kotlin over the past year. Here are my top tips:

1. Start with data classes — the boilerplate reduction is immediate
2. Use the Kotlin converter in IntelliJ but always review the output
3. Write new code in Kotlin, convert old code gradually
4. Enable strict null checks from day one', 2, 2),
('I''ve used both KMP and Flutter. Here''s my take: If your team knows Kotlin and you want native UI, go with KMP. If you want a single UI codebase and don''t mind learning Dart, Flutter is great. Both are production-ready.', 2, 3),
('For microservices, I recommend hexagonal architecture with Kotlin. The sealed class feature is perfect for modeling domain events, and extension functions make the adapter layer very clean.', 2, 4);
