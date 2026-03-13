package com.thekotlin.service

import com.thekotlin.dto.CreateNewsRequest
import com.thekotlin.model.News
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.repository.NewsRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime

class NewsServiceTest {

    private val newsRepository = mockk<NewsRepository>()
    private val service = NewsService(newsRepository)

    private val author = User(id = 1, username = "editor", email = "e@t.com", passwordHash = "h", role = UserRole.AUTHOR)
    private val news = News(
        id = 1, title = "Kotlin 2.2 Released", slug = "kotlin-2-2-released",
        summary = "Big release", content = "Full details here", tag = "Release",
        tagColor = "#7F52FF", sourceUrl = "https://kotlinlang.org",
        author = author, publishedAt = LocalDateTime.now(),
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )

    @Test
    fun `listNews - without tag filter`() {
        val pageable = PageRequest.of(0, 20)
        every { newsRepository.findByIsPublishedTrueOrderByPublishedAtDesc(pageable) } returns PageImpl(listOf(news))

        val result = service.listNews(0, 20, null)

        assertEquals(1, result.content.size)
        assertEquals("Kotlin 2.2 Released", result.content[0].title)
    }

    @Test
    fun `listNews - with tag filter`() {
        val pageable = PageRequest.of(0, 20)
        every { newsRepository.findByTagAndIsPublishedTrue("Release", pageable) } returns PageImpl(listOf(news))

        val result = service.listNews(0, 20, "Release")

        assertEquals(1, result.content.size)
        assertEquals("Release", result.content[0].tag)
    }

    @Test
    fun `getBySlug - found`() {
        every { newsRepository.findBySlug("kotlin-2-2-released") } returns news

        val result = service.getBySlug("kotlin-2-2-released")

        assertNotNull(result)
        assertEquals("Kotlin 2.2 Released", result!!.title)
    }

    @Test
    fun `getBySlug - not found returns null`() {
        every { newsRepository.findBySlug("nonexistent") } returns null

        assertNull(service.getBySlug("nonexistent"))
    }

    @Test
    fun `create - happy path with auto-generated slug`() {
        val request = CreateNewsRequest("Kotlin 2.3 Preview!", "Preview details", tag = "Release")
        val savedSlot = slot<News>()
        every { newsRepository.save(capture(savedSlot)) } returns news.copy(title = "Kotlin 2.3 Preview!")

        val result = service.create(request, author)

        assertNotNull(result)
        assertEquals("kotlin-23-preview", savedSlot.captured.slug)
        verify { newsRepository.save(any()) }
    }

    @Test
    fun `create - custom tagColor`() {
        val request = CreateNewsRequest("Custom News", tag = "Custom", tagColor = "#FF0000")
        val savedSlot = slot<News>()
        every { newsRepository.save(capture(savedSlot)) } returns news

        service.create(request, author)

        assertEquals("#FF0000", savedSlot.captured.tagColor)
    }

    @Test
    fun `create - null tagColor uses default`() {
        val request = CreateNewsRequest("Default Color News", tag = "General", tagColor = null)
        val savedSlot = slot<News>()
        every { newsRepository.save(capture(savedSlot)) } returns news

        service.create(request, author)

        assertEquals("#7F52FF", savedSlot.captured.tagColor)
    }

    @Test
    fun `create - news without author author field`() {
        val newsNoAuthor = news.copy(author = null)
        val request = CreateNewsRequest("No Author News")
        every { newsRepository.save(any()) } returns newsNoAuthor

        val result = service.create(request, author)

        assertNull(result.author)
    }

    @Test
    fun `countPublished - delegates to repository`() {
        every { newsRepository.countByIsPublishedTrue() } returns 8L

        assertEquals(8L, service.countPublished())
    }
}
