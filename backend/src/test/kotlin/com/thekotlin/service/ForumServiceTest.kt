package com.thekotlin.service

import com.thekotlin.dto.CreatePostRequest
import com.thekotlin.dto.CreateThreadRequest
import com.thekotlin.model.*
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.ForumPostRepository
import com.thekotlin.repository.ForumThreadRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime
import java.util.*

class ForumServiceTest {

    private val threadRepository = mockk<ForumThreadRepository>()
    private val postRepository = mockk<ForumPostRepository>()
    private val categoryRepository = mockk<CategoryRepository>()
    private val service = ForumService(threadRepository, postRepository, categoryRepository)

    private val author = User(id = 1, username = "user1", email = "u@t.com", passwordHash = "h", role = UserRole.USER)
    private val category = Category(id = 1, name = "General", slug = "general", description = "Gen", icon = "G")
    private val thread = ForumThread(
        id = 1, title = "Thread 1", author = author, category = category,
        isPinned = false, isLocked = false, viewCount = 5,
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )
    private val lockedThread = thread.copy(id = 2, isLocked = true)
    private val post = ForumPost(
        id = 1, content = "Hello", author = author, thread = thread,
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )

    @Test
    fun `listThreads - without category`() {
        val pageable = PageRequest.of(0, 20)
        every { threadRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable) } returns PageImpl(listOf(thread))
        every { postRepository.countByThreadId(1L) } returns 3L

        val result = service.listThreads(0, 20, null)

        assertEquals(1, result.content.size)
        assertEquals(3L, result.content[0].postCount)
    }

    @Test
    fun `listThreads - with category filter`() {
        val pageable = PageRequest.of(0, 20)
        every { threadRepository.findByCategorySlug("general", pageable) } returns PageImpl(listOf(thread))
        every { postRepository.countByThreadId(1L) } returns 1L

        val result = service.listThreads(0, 20, "general")

        assertEquals(1, result.content.size)
    }

    @Test
    fun `listThreads - thread with null category`() {
        val threadNoCategory = thread.copy(category = null)
        val pageable = PageRequest.of(0, 20)
        every { threadRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable) } returns PageImpl(listOf(threadNoCategory))
        every { postRepository.countByThreadId(1L) } returns 0L

        val result = service.listThreads(0, 20, null)

        assertNull(result.content[0].category)
    }

    @Test
    fun `getThread - thread found with posts`() {
        every { threadRepository.findById(1L) } returns Optional.of(thread)
        every { postRepository.findByThreadIdOrderByCreatedAtAsc(1L, PageRequest.of(0, 50)) } returns PageImpl(listOf(post))

        val result = service.getThread(1L, 0, 50)

        assertNotNull(result)
        assertEquals("Thread 1", result!!.title)
        assertEquals(1, result.posts.size)
    }

    @Test
    fun `getThread - thread not found returns null`() {
        every { threadRepository.findById(999L) } returns Optional.empty()

        val result = service.getThread(999L, 0, 50)

        assertNull(result)
    }

    @Test
    fun `getThread - thread with null category`() {
        val threadNoCategory = thread.copy(category = null)
        every { threadRepository.findById(1L) } returns Optional.of(threadNoCategory)
        every { postRepository.findByThreadIdOrderByCreatedAtAsc(1L, PageRequest.of(0, 50)) } returns PageImpl(emptyList())

        val result = service.getThread(1L, 0, 50)

        assertNotNull(result)
        assertNull(result!!.category)
    }

    @Test
    fun `createThread - with category`() {
        val request = CreateThreadRequest("New Thread", "First post content", categoryId = 1L)
        every { categoryRepository.findById(1L) } returns Optional.of(category)
        every { threadRepository.save(any()) } returns thread
        every { postRepository.save(any()) } returns post

        val result = service.createThread(request, author)

        assertEquals("Thread 1", result.title)
        assertEquals(1L, result.postCount)
        verify { postRepository.save(any()) }
    }

    @Test
    fun `createThread - without category`() {
        val request = CreateThreadRequest("No Category Thread", "Content", categoryId = null)
        val threadNoCategory = thread.copy(category = null)
        every { threadRepository.save(any()) } returns threadNoCategory
        every { postRepository.save(any()) } returns post

        val result = service.createThread(request, author)

        assertNull(result.category)
    }

    @Test
    fun `createPost - happy path`() {
        val request = CreatePostRequest("Reply content")
        every { threadRepository.findById(1L) } returns Optional.of(thread)
        every { postRepository.save(any()) } returns post

        val result = service.createPost(1L, request, author)

        assertNotNull(result)
        assertEquals("Hello", result!!.content)
    }

    @Test
    fun `createPost - thread not found returns null`() {
        every { threadRepository.findById(999L) } returns Optional.empty()

        val result = service.createPost(999L, CreatePostRequest("Reply"), author)

        assertNull(result)
    }

    @Test
    fun `createPost - locked thread throws IllegalStateException`() {
        every { threadRepository.findById(2L) } returns Optional.of(lockedThread)

        val ex = assertThrows<IllegalStateException> {
            service.createPost(2L, CreatePostRequest("Reply"), author)
        }
        assertEquals("Thread is locked", ex.message)
    }

    @Test
    fun `createPost - with parent post`() {
        val request = CreatePostRequest("Reply", parentId = 1L)
        every { threadRepository.findById(1L) } returns Optional.of(thread)
        every { postRepository.findById(1L) } returns Optional.of(post)
        val replyPost = post.copy(id = 2, content = "Reply", parent = post)
        every { postRepository.save(any()) } returns replyPost

        val result = service.createPost(1L, request, author)

        assertNotNull(result)
        assertEquals(1L, result!!.parentId)
    }

    @Test
    fun `createPost - without parent post`() {
        val request = CreatePostRequest("No parent", parentId = null)
        val noParentPost = post.copy(parent = null)
        every { threadRepository.findById(1L) } returns Optional.of(thread)
        every { postRepository.save(any()) } returns noParentPost

        val result = service.createPost(1L, request, author)

        assertNotNull(result)
        assertNull(result!!.parentId)
    }

    @Test
    fun `countThreads - delegates to repository`() {
        every { threadRepository.count() } returns 15L

        assertEquals(15L, service.countThreads())
    }
}
