package com.thekotlin.controller

import com.thekotlin.dto.CategoryResponse
import com.thekotlin.dto.StatsResponse
import com.thekotlin.dto.TagResponse
import com.thekotlin.dto.UserResponse
import com.thekotlin.model.User
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.TagRepository
import com.thekotlin.repository.UserRepository
import com.thekotlin.service.ArticleService
import com.thekotlin.service.DtoMapper
import com.thekotlin.service.ForumService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class GeneralController(
    private val categoryRepository: CategoryRepository,
    private val tagRepository: TagRepository,
    private val articleService: ArticleService,
    private val forumService: ForumService,
    private val userRepository: UserRepository
) {

    @GetMapping("/categories")
    fun listCategories(): List<CategoryResponse> {
        return categoryRepository.findAllByOrderBySortOrderAsc().map {
            DtoMapper.toCategoryResponse(it)
        }
    }

    @GetMapping("/tags")
    fun listTags(): List<TagResponse> {
        return tagRepository.findAll().map { DtoMapper.toTagResponse(it) }
    }

    @GetMapping("/users/me")
    fun getCurrentUser(@AuthenticationPrincipal user: User): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(DtoMapper.toUserResponse(user))
    }

    @GetMapping("/stats")
    fun getStats(): StatsResponse {
        return StatsResponse(
            articleCount = articleService.countPublished(),
            categoryCount = categoryRepository.count(),
            threadCount = forumService.countThreads(),
            userCount = userRepository.count()
        )
    }
}
