package com.thekotlin.dto

import java.time.LocalDateTime

// ==================== Auth ====================
data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val displayName: String? = null
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val user: UserResponse
)

// ==================== User ====================
data class UserResponse(
    val id: Long,
    val username: String,
    val email: String,
    val displayName: String?,
    val bio: String?,
    val avatarUrl: String?,
    val role: String,
    val createdAt: LocalDateTime
)

// ==================== Article ====================
data class ArticleResponse(
    val id: Long,
    val title: String,
    val slug: String,
    val summary: String?,
    val content: String,
    val author: UserResponse,
    val category: CategoryResponse?,
    val tags: List<TagResponse>,
    val viewCount: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class ArticleListResponse(
    val id: Long,
    val title: String,
    val slug: String,
    val summary: String?,
    val author: UserResponse,
    val category: CategoryResponse?,
    val tags: List<TagResponse>,
    val viewCount: Int,
    val createdAt: LocalDateTime
)

data class CreateArticleRequest(
    val title: String,
    val summary: String? = null,
    val content: String,
    val categoryId: Long? = null,
    val tagIds: List<Long> = emptyList()
)

// ==================== Category ====================
data class CategoryResponse(
    val id: Long,
    val name: String,
    val slug: String,
    val description: String?,
    val icon: String?
)

// ==================== Tag ====================
data class TagResponse(
    val id: Long,
    val name: String,
    val slug: String
)

// ==================== Forum ====================
data class ForumThreadResponse(
    val id: Long,
    val title: String,
    val author: UserResponse,
    val category: CategoryResponse?,
    val isPinned: Boolean,
    val isLocked: Boolean,
    val viewCount: Int,
    val postCount: Long,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class ForumThreadDetailResponse(
    val id: Long,
    val title: String,
    val author: UserResponse,
    val category: CategoryResponse?,
    val isPinned: Boolean,
    val isLocked: Boolean,
    val viewCount: Int,
    val posts: List<ForumPostResponse>,
    val createdAt: LocalDateTime
)

data class ForumPostResponse(
    val id: Long,
    val content: String,
    val author: UserResponse,
    val parentId: Long?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CreateThreadRequest(
    val title: String,
    val content: String,
    val categoryId: Long? = null
)

data class CreatePostRequest(
    val content: String,
    val parentId: Long? = null
)

// ==================== News ====================
data class NewsResponse(
    val id: Long,
    val title: String,
    val slug: String,
    val summary: String?,
    val content: String?,
    val tag: String,
    val tagColor: String,
    val sourceUrl: String?,
    val author: UserResponse?,
    val publishedAt: LocalDateTime,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CreateNewsRequest(
    val title: String,
    val summary: String? = null,
    val content: String? = null,
    val tag: String = "General",
    val tagColor: String? = null,
    val sourceUrl: String? = null
)

// ==================== Common ====================
data class PageResponse<T>(
    val content: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)

data class StatsResponse(
    val articleCount: Long,
    val categoryCount: Long,
    val threadCount: Long,
    val userCount: Long,
    val newsCount: Long
)
