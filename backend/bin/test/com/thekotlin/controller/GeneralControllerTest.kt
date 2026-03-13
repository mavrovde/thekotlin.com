package com.thekotlin.controller

import com.thekotlin.dto.CategoryResponse
import com.thekotlin.dto.TagResponse
import com.thekotlin.model.Category
import com.thekotlin.model.Tag
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.TagRepository
import com.thekotlin.repository.UserRepository
import com.thekotlin.service.ArticleService
import com.thekotlin.service.ForumService
import com.thekotlin.service.NewsService
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class GeneralControllerTest {

    private val categoryRepository = mockk<CategoryRepository>()
    private val tagRepository = mockk<TagRepository>()
    private val articleService = mockk<ArticleService>()
    private val forumService = mockk<ForumService>()
    private val newsService = mockk<NewsService>()
    private val userRepository = mockk<UserRepository>()
    private val controller = GeneralController(
        categoryRepository, tagRepository, articleService, forumService, newsService, userRepository
    )

    @Test
    fun `listCategories - returns all categories`() {
        val categories = listOf(
            Category(1, "Kotlin", "kotlin", "Desc", "K", 0),
            Category(2, "Spring", "spring", null, null, 1)
        )
        every { categoryRepository.findAllByOrderBySortOrderAsc() } returns categories

        val result = controller.listCategories()

        assertEquals(2, result.size)
        assertEquals("Kotlin", result[0].name)
    }

    @Test
    fun `listTags - returns all tags`() {
        val tags = listOf(Tag(1, "Beginner", "beginner"), Tag(2, "Advanced", "advanced"))
        every { tagRepository.findAll() } returns tags

        val result = controller.listTags()

        assertEquals(2, result.size)
    }

    @Test
    fun `getCurrentUser - returns authenticated user`() {
        val user = User(id = 1, username = "me", email = "me@t.com", passwordHash = "h", role = UserRole.USER)

        val result = controller.getCurrentUser(user)

        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("me", result.body!!.username)
    }

    @Test
    fun `getStats - returns all counts`() {
        every { articleService.countPublished() } returns 10L
        every { categoryRepository.count() } returns 5L
        every { forumService.countThreads() } returns 20L
        every { userRepository.count() } returns 100L
        every { newsService.countPublished() } returns 8L

        val result = controller.getStats()

        assertEquals(10L, result.articleCount)
        assertEquals(5L, result.categoryCount)
        assertEquals(20L, result.threadCount)
        assertEquals(100L, result.userCount)
        assertEquals(8L, result.newsCount)
    }
}
