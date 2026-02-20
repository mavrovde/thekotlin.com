package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.service.ForumService
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

class ForumControllerTest {

    private val forumService = mockk<ForumService>()
    private val controller = ForumController(forumService)

    private val userResp = UserResponse(1, "user1", "u@t.com", "User", null, null, "USER", LocalDateTime.now())
    private val threadResp = ForumThreadResponse(
        id = 1, title = "Thread", author = userResp, category = null,
        isPinned = false, isLocked = false, viewCount = 0, postCount = 1,
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )
    private val threadDetailResp = ForumThreadDetailResponse(
        id = 1, title = "Thread", author = userResp, category = null,
        isPinned = false, isLocked = false, viewCount = 0,
        posts = emptyList(), createdAt = LocalDateTime.now()
    )
    private val postResp = ForumPostResponse(
        id = 1, content = "Reply", author = userResp, parentId = null,
        createdAt = LocalDateTime.now(), updatedAt = LocalDateTime.now()
    )
    private val user = User(id = 1, username = "user1", email = "u@t.com", passwordHash = "h", role = UserRole.USER)

    @Test
    fun `listThreads - returns paginated list`() {
        every { forumService.listThreads(0, 20, null) } returns PageResponse(listOf(threadResp), 0, 20, 1, 1)

        val result = controller.listThreads(0, 20, null)
        assertEquals(1, result.content.size)
    }

    @Test
    fun `getThread - found returns 200`() {
        every { forumService.getThread(1L, 0, 50) } returns threadDetailResp

        val result = controller.getThread(1L, 0, 50)
        assertEquals(HttpStatus.OK, result.statusCode)
    }

    @Test
    fun `getThread - not found returns 404`() {
        every { forumService.getThread(999L, 0, 50) } returns null

        val result = controller.getThread(999L, 0, 50)
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    fun `createThread - returns 201 CREATED`() {
        val request = CreateThreadRequest("New Thread", "Content")
        every { forumService.createThread(request, user) } returns threadResp

        val result = controller.createThread(request, user)
        assertEquals(HttpStatus.CREATED, result.statusCode)
    }

    @Test
    fun `createPost - success returns 201`() {
        val request = CreatePostRequest("Reply content")
        every { forumService.createPost(1L, request, user) } returns postResp

        val result = controller.createPost(1L, request, user)
        assertEquals(HttpStatus.CREATED, result.statusCode)
    }

    @Test
    fun `createPost - thread not found returns 404`() {
        val request = CreatePostRequest("Reply")
        every { forumService.createPost(999L, request, user) } returns null

        val result = controller.createPost(999L, request, user)
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
    }

    @Test
    fun `createPost - locked thread returns 403`() {
        val request = CreatePostRequest("Reply")
        every { forumService.createPost(2L, request, user) } throws IllegalStateException("Thread is locked")

        val result = controller.createPost(2L, request, user)
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        @Suppress("UNCHECKED_CAST")
        val body = result.body as Map<String, String?>
        assertEquals("Thread is locked", body["error"])
    }
}
