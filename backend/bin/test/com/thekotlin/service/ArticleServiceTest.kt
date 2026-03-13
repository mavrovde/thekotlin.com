package com.thekotlin.service

import com.thekotlin.dto.CreateArticleRequest
import com.thekotlin.model.*
import com.thekotlin.repository.ArticleRepository
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.TagRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import java.time.LocalDateTime
import java.util.*

class ArticleServiceTest {

    private val articleRepository = mockk<ArticleRepository>()
    private val categoryRepository = mockk<CategoryRepository>()
    private val tagRepository = mockk<TagRepository>()
    private val service = ArticleService(articleRepository, categoryRepository, tagRepository)

    private val author = User(id = 1, username = "author", email = "a@t.com", passwordHash = "h", role = UserRole.USER)
    private val category = Category(id = 1, name = "Kotlin", slug = "kotlin", description = "Kotlin stuff", icon = "K")
    private val tag = Tag(id = 1, name = "Beginner", slug = "beginner")
    private val article = Article(
        id = 1, title = "Test Article", slug = "test-article",
        summary = "Summary", content = "Content", author = author,
        category = category, tags = setOf(tag), status = "PUBLISHED",
        viewCount = 10, createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )

    @Test
    fun `listArticles - without category filter`() {
        val pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending())
        every { articleRepository.findByStatus("PUBLISHED", pageable) } returns PageImpl(listOf(article))

        val result = service.listArticles(0, 10, null)

        assertEquals(1, result.content.size)
        assertEquals("Test Article", result.content[0].title)
    }

    @Test
    fun `listArticles - with category filter`() {
        val pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending())
        every { articleRepository.findByCategorySlugAndStatus("kotlin", "PUBLISHED", pageable) } returns PageImpl(listOf(article))

        val result = service.listArticles(0, 10, "kotlin")

        assertEquals(1, result.content.size)
    }

    @Test
    fun `getBySlug - article found`() {
        every { articleRepository.findBySlug("test-article") } returns article

        val result = service.getBySlug("test-article")

        assertNotNull(result)
        assertEquals("Test Article", result!!.title)
    }

    @Test
    fun `getBySlug - article not found returns null`() {
        every { articleRepository.findBySlug("nonexistent") } returns null

        val result = service.getBySlug("nonexistent")

        assertNull(result)
    }

    @Test
    fun `search - returns matching results`() {
        val pageable = PageRequest.of(0, 10)
        every { articleRepository.search("kotlin", pageable) } returns PageImpl(listOf(article))

        val result = service.search("kotlin", 0, 10)

        assertEquals(1, result.content.size)
    }

    @Test
    fun `getPopular - returns popular articles`() {
        val pageable = PageRequest.of(0, 5)
        every { articleRepository.findPopular(pageable) } returns PageImpl(listOf(article))

        val result = service.getPopular(5)

        assertEquals(1, result.size)
    }

    @Test
    fun `create - with category and tags`() {
        val request = CreateArticleRequest("New Article", "Sum", "Body", categoryId = 1L, tagIds = listOf(1L))
        every { categoryRepository.findById(1L) } returns Optional.of(category)
        every { tagRepository.findAllById(listOf(1L)) } returns listOf(tag)
        every { articleRepository.save(any()) } returns article

        val result = service.create(request, author)

        assertNotNull(result)
        verify { articleRepository.save(any()) }
    }

    @Test
    fun `create - without category and empty tags`() {
        val request = CreateArticleRequest("Title Only", content = "Content")
        every { articleRepository.save(any()) } returns article.copy(category = null, tags = emptySet())

        val result = service.create(request, author)

        assertNotNull(result)
    }

    @Test
    fun `create - categoryId not found returns null category`() {
        val request = CreateArticleRequest("Title", content = "C", categoryId = 999L)
        every { categoryRepository.findById(999L) } returns Optional.empty()
        every { articleRepository.save(any()) } returns article.copy(category = null)

        val result = service.create(request, author)

        assertNotNull(result)
    }

    @Test
    fun `countPublished - delegates to repository`() {
        every { articleRepository.countByStatus("PUBLISHED") } returns 42L

        assertEquals(42L, service.countPublished())
    }
}
