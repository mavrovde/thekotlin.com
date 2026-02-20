package com.thekotlin.service

import com.thekotlin.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class DtoMapperTest {

    private val user = User(
        id = 1, username = "testuser", email = "test@test.com",
        passwordHash = "hash", displayName = "Test User", bio = "Developer",
        avatarUrl = "https://avatar.com/img.png", role = UserRole.ADMIN,
        createdAt = LocalDateTime.of(2025, 1, 1, 0, 0)
    )
    private val category = Category(
        id = 1, name = "Kotlin", slug = "kotlin",
        description = "Kotlin programming", icon = "K"
    )
    private val tag = Tag(id = 1, name = "Beginner", slug = "beginner")
    private val article = Article(
        id = 1, title = "Article Title", slug = "article-title",
        summary = "Summary", content = "Full content", author = user,
        category = category, tags = setOf(tag), status = "PUBLISHED",
        viewCount = 42, createdAt = LocalDateTime.of(2025, 6, 1, 0, 0),
        updatedAt = LocalDateTime.of(2025, 6, 2, 0, 0)
    )

    @Test
    fun `toUserResponse - maps all fields`() {
        val result = DtoMapper.toUserResponse(user)

        assertEquals(1, result.id)
        assertEquals("testuser", result.username)
        assertEquals("test@test.com", result.email)
        assertEquals("Test User", result.displayName)
        assertEquals("Developer", result.bio)
        assertEquals("https://avatar.com/img.png", result.avatarUrl)
        assertEquals("ADMIN", result.role)
        assertEquals(LocalDateTime.of(2025, 1, 1, 0, 0), result.createdAt)
    }

    @Test
    fun `toUserResponse - handles null optional fields`() {
        val minUser = user.copy(displayName = null, bio = null, avatarUrl = null)
        val result = DtoMapper.toUserResponse(minUser)

        assertNull(result.displayName)
        assertNull(result.bio)
        assertNull(result.avatarUrl)
    }

    @Test
    fun `toCategoryResponse - maps all fields`() {
        val result = DtoMapper.toCategoryResponse(category)

        assertEquals(1, result.id)
        assertEquals("Kotlin", result.name)
        assertEquals("kotlin", result.slug)
        assertEquals("Kotlin programming", result.description)
        assertEquals("K", result.icon)
    }

    @Test
    fun `toCategoryResponse - handles null optional fields`() {
        val minCat = category.copy(description = null, icon = null)
        val result = DtoMapper.toCategoryResponse(minCat)

        assertNull(result.description)
        assertNull(result.icon)
    }

    @Test
    fun `toTagResponse - maps all fields`() {
        val result = DtoMapper.toTagResponse(tag)

        assertEquals(1, result.id)
        assertEquals("Beginner", result.name)
        assertEquals("beginner", result.slug)
    }

    @Test
    fun `toArticleResponse - with category and tags`() {
        val result = DtoMapper.toArticleResponse(article)

        assertEquals(1, result.id)
        assertEquals("Article Title", result.title)
        assertEquals("article-title", result.slug)
        assertEquals("Summary", result.summary)
        assertEquals("Full content", result.content)
        assertNotNull(result.category)
        assertEquals("Kotlin", result.category!!.name)
        assertEquals(1, result.tags.size)
        assertEquals("Beginner", result.tags[0].name)
        assertEquals(42, result.viewCount)
    }

    @Test
    fun `toArticleResponse - without category (null)`() {
        val articleNoCategory = article.copy(category = null)
        val result = DtoMapper.toArticleResponse(articleNoCategory)

        assertNull(result.category)
    }

    @Test
    fun `toArticleResponse - with empty tags`() {
        val articleNoTags = article.copy(tags = emptySet())
        val result = DtoMapper.toArticleResponse(articleNoTags)

        assertTrue(result.tags.isEmpty())
    }

    @Test
    fun `toArticleListResponse - with category and tags`() {
        val result = DtoMapper.toArticleListResponse(article)

        assertEquals("Article Title", result.title)
        assertNotNull(result.category)
        assertEquals(1, result.tags.size)
    }

    @Test
    fun `toArticleListResponse - without category (null)`() {
        val articleNoCategory = article.copy(category = null)
        val result = DtoMapper.toArticleListResponse(articleNoCategory)

        assertNull(result.category)
    }

    @Test
    fun `toForumPostResponse - with parent (parentId mapped)`() {
        val thread = ForumThread(id = 1, title = "Thread", author = user)
        val parentPost = ForumPost(id = 10, content = "Parent", author = user, thread = thread)
        val childPost = ForumPost(id = 11, content = "Reply", author = user, thread = thread, parent = parentPost,
            createdAt = LocalDateTime.of(2025, 7, 1, 0, 0), updatedAt = LocalDateTime.of(2025, 7, 1, 0, 0))

        val result = DtoMapper.toForumPostResponse(childPost)

        assertEquals(11, result.id)
        assertEquals("Reply", result.content)
        assertEquals(10L, result.parentId)
    }

    @Test
    fun `toForumPostResponse - without parent (null parentId)`() {
        val thread = ForumThread(id = 1, title = "Thread", author = user)
        val rootPost = ForumPost(id = 1, content = "Root post", author = user, thread = thread, parent = null,
            createdAt = LocalDateTime.of(2025, 7, 1, 0, 0), updatedAt = LocalDateTime.of(2025, 7, 1, 0, 0))

        val result = DtoMapper.toForumPostResponse(rootPost)

        assertEquals(1, result.id)
        assertNull(result.parentId)
    }
}
