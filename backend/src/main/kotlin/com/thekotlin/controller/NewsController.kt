package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.service.NewsService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/news")
class NewsController(
    private val newsService: NewsService
) {

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) tag: String?
    ): PageResponse<NewsResponse> {
        return newsService.listNews(page, size, tag)
    }

    @GetMapping("/{slug}")
    fun getBySlug(@PathVariable slug: String): ResponseEntity<NewsResponse> {
        val news = newsService.getBySlug(slug)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(news)
    }

    @PostMapping
    fun create(
        @RequestBody request: CreateNewsRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<NewsResponse> {
        val news = newsService.create(request, user)
        return ResponseEntity.status(HttpStatus.CREATED).body(news)
    }
}
