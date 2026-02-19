package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.service.ForumService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/forum")
class ForumController(
    private val forumService: ForumService
) {

    @GetMapping("/threads")
    fun listThreads(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) category: String?
    ): PageResponse<ForumThreadResponse> {
        return forumService.listThreads(page, size, category)
    }

    @GetMapping("/threads/{id}")
    fun getThread(
        @PathVariable id: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<ForumThreadDetailResponse> {
        val thread = forumService.getThread(id, page, size)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(thread)
    }

    @PostMapping("/threads")
    fun createThread(
        @RequestBody request: CreateThreadRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ForumThreadResponse> {
        val thread = forumService.createThread(request, user)
        return ResponseEntity.status(HttpStatus.CREATED).body(thread)
    }

    @PostMapping("/threads/{id}/posts")
    fun createPost(
        @PathVariable id: Long,
        @RequestBody request: CreatePostRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<Any> {
        return try {
            val post = forumService.createPost(id, request, user)
                ?: return ResponseEntity.notFound().build()
            ResponseEntity.status(HttpStatus.CREATED).body(post)
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body(mapOf("error" to e.message))
        }
    }
}
