package com.thekotlin.service

import com.thekotlin.dto.*
import com.thekotlin.model.*

object DtoMapper {

    fun toUserResponse(user: User) = UserResponse(
        id = user.id,
        username = user.username,
        email = user.email,
        displayName = user.displayName,
        bio = user.bio,
        avatarUrl = user.avatarUrl,
        role = user.role.name,
        createdAt = user.createdAt
    )

    fun toCategoryResponse(category: Category) = CategoryResponse(
        id = category.id,
        name = category.name,
        slug = category.slug,
        description = category.description,
        icon = category.icon
    )

    fun toTagResponse(tag: Tag) = TagResponse(
        id = tag.id,
        name = tag.name,
        slug = tag.slug
    )

    fun toArticleResponse(article: Article) = ArticleResponse(
        id = article.id,
        title = article.title,
        slug = article.slug,
        summary = article.summary,
        content = article.content,
        author = toUserResponse(article.author),
        category = article.category?.let { toCategoryResponse(it) },
        tags = article.tags.map { toTagResponse(it) },
        viewCount = article.viewCount,
        createdAt = article.createdAt,
        updatedAt = article.updatedAt
    )

    fun toArticleListResponse(article: Article) = ArticleListResponse(
        id = article.id,
        title = article.title,
        slug = article.slug,
        summary = article.summary,
        author = toUserResponse(article.author),
        category = article.category?.let { toCategoryResponse(it) },
        tags = article.tags.map { toTagResponse(it) },
        viewCount = article.viewCount,
        createdAt = article.createdAt
    )

    fun toForumPostResponse(post: ForumPost) = ForumPostResponse(
        id = post.id,
        content = post.content,
        author = toUserResponse(post.author),
        parentId = post.parent?.id,
        createdAt = post.createdAt,
        updatedAt = post.updatedAt
    )
}
