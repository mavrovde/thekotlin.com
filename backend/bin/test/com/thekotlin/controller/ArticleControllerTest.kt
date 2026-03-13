package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.service.ArticleService
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

class ArticleControllerTest {

    private val articleService = mockk<ArticleService>()
    private val controller = ArticleController(articleService)

    private val userResp = UserResponse(1, "author", "a@t.com", "Author", null, null, "USER", LocalDateTime.now())
    private val catResp = CategoryResponse(1, "Kotlin", "kotlin", "Desc", "K")
    private val tagResp = TagResponse(1, "Beginner", "beginner")

    private val articleListResp = ArticleListResponse(
        id = 1, title = "Article", slug = "article", summary = "Sum",
        author = userResp, category = catResp, tags = listOf(tagResp),
        viewCount = 10, createdAt = LocalDateTime.now()
    )
    private val articleResp = ArticleResponse(
        id = 1, title = "Article", slug = "article", summary = "Sum", content = "Content",
        author = userResp, category = catResp, tags = listOf(tagResp),
        viewCount = 10, createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )
    private val pageResp = PageResponse(listOf(articleListResp), 0, 10, 1, 1)

    @Test
    fun `list - returns paginated articles`() {
        every { articleService.listArticles(0, 10, null) } returns pageResp

        val result = controller.list(0, 10, null)
        assertEquals(1, result.content.size)
    }

    @Test
    fun `list - with category filter`() {
        every { articleService.listArticles(0, 10, "kotlin") } returns pageResp

        val result = controller.list(0, 10, "kotlin")
        assertEquals(1, result.content.size)
    }

    @Test
    fun `getBySlug - found returns 200`() {
        every { articleService.getBySlug("article") } returns articleResp

        val result = controller.getBySlug("article")
        assertEquals(HttpStatus.OK, result.statusCode)
    }

    @Test
    fun `getBySlug - not found returns 404`() {
        every { articleService.getBySlug("nonexistent") } returns null

        val result = controller.getBySlug("nonexistent")
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    fun `search - returns results`() {
        every { articleService.search("kotlin", 0, 10) } returns pageResp

        val result = controller.search("kotlin", 0, 10)
        assertEquals(1, result.content.size)
    }

    @Test
    fun `popular - returns popular articles`() {
        every { articleService.getPopular(5) } returns listOf(articleListResp)

        val result = controller.popular(5)
        assertEquals(1, result.size)
    }

    @Test
    fun `create - returns 201 CREATED`() {
        val user = User(id = 1, username = "author", email = "a@t.com", passwordHash = "h", role = UserRole.USER)
        val request = CreateArticleRequest("Title", "Sum", "Content")
        every { articleService.create(request, user) } returns articleResp

        val result = controller.create(request, user)
        assertEquals(HttpStatus.CREATED, result.statusCode)
    }
}
