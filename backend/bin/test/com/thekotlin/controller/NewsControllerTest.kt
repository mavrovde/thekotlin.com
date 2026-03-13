package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.service.NewsService
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

class NewsControllerTest {

    private val newsService = mockk<NewsService>()
    private val controller = NewsController(newsService)

    private val newsResp = NewsResponse(
        id = 1, title = "News", slug = "news", summary = "Sum", content = null,
        tag = "Release", tagColor = "#7F52FF", sourceUrl = "https://example.com",
        author = null, publishedAt = LocalDateTime.now(),
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )

    @Test
    fun `list - returns paginated news`() {
        every { newsService.listNews(0, 20, null) } returns PageResponse(listOf(newsResp), 0, 20, 1, 1)

        val result = controller.list(0, 20, null)
        assertEquals(1, result.content.size)
    }

    @Test
    fun `list - with tag filter`() {
        every { newsService.listNews(0, 20, "Release") } returns PageResponse(listOf(newsResp), 0, 20, 1, 1)

        val result = controller.list(0, 20, "Release")
        assertEquals(1, result.content.size)
    }

    @Test
    fun `getBySlug - found returns 200`() {
        every { newsService.getBySlug("news") } returns newsResp

        val result = controller.getBySlug("news")
        assertEquals(HttpStatus.OK, result.statusCode)
    }

    @Test
    fun `getBySlug - not found returns 404`() {
        every { newsService.getBySlug("missing") } returns null

        val result = controller.getBySlug("missing")
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    fun `create - returns 201 CREATED`() {
        val user = User(id = 1, username = "editor", email = "e@t.com", passwordHash = "h", role = UserRole.AUTHOR)
        val request = CreateNewsRequest("Breaking News", tag = "Release")
        every { newsService.create(request, user) } returns newsResp

        val result = controller.create(request, user)
        assertEquals(HttpStatus.CREATED, result.statusCode)
    }
}
