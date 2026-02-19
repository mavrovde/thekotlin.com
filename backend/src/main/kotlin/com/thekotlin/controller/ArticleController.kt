package com.thekotlin.controller

import com.thekotlin.dto.*
import com.thekotlin.model.User
import com.thekotlin.service.ArticleService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/articles")
class ArticleController(
    private val articleService: ArticleService
) {

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) category: String?
    ): PageResponse<ArticleListResponse> {
        return articleService.listArticles(page, size, category)
    }

    @GetMapping("/{slug}")
    fun getBySlug(@PathVariable slug: String): ResponseEntity<ArticleResponse> {
        val article = articleService.getBySlug(slug)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(article)
    }

    @GetMapping("/search")
    fun search(
        @RequestParam q: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): PageResponse<ArticleListResponse> {
        return articleService.search(q, page, size)
    }

    @GetMapping("/popular")
    fun popular(@RequestParam(defaultValue = "5") size: Int): List<ArticleListResponse> {
        return articleService.getPopular(size)
    }

    @PostMapping
    fun create(
        @RequestBody request: CreateArticleRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ArticleResponse> {
        val article = articleService.create(request, user)
        return ResponseEntity.status(HttpStatus.CREATED).body(article)
    }
}
