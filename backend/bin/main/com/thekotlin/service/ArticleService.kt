package com.thekotlin.service

import com.thekotlin.dto.*
import com.thekotlin.model.Article
import com.thekotlin.repository.ArticleRepository
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.TagRepository
import com.thekotlin.model.User
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ArticleService(
    private val articleRepository: ArticleRepository,
    private val categoryRepository: CategoryRepository,
    private val tagRepository: TagRepository
) {

    fun listArticles(page: Int, size: Int, category: String?): PageResponse<ArticleListResponse> {
        val pageable = PageRequest.of(page, size, Sort.by("createdAt").descending())

        val articles = if (category != null) {
            articleRepository.findByCategorySlugAndStatus(category, "PUBLISHED", pageable)
        } else {
            articleRepository.findByStatus("PUBLISHED", pageable)
        }

        return PageResponse(
            content = articles.content.map { DtoMapper.toArticleListResponse(it) },
            page = articles.number,
            size = articles.size,
            totalElements = articles.totalElements,
            totalPages = articles.totalPages
        )
    }

    fun getBySlug(slug: String): ArticleResponse? {
        return articleRepository.findBySlug(slug)?.let { DtoMapper.toArticleResponse(it) }
    }

    fun search(query: String, page: Int, size: Int): PageResponse<ArticleListResponse> {
        val pageable = PageRequest.of(page, size)
        val results = articleRepository.search(query, pageable)
        return PageResponse(
            content = results.content.map { DtoMapper.toArticleListResponse(it) },
            page = results.number,
            size = results.size,
            totalElements = results.totalElements,
            totalPages = results.totalPages
        )
    }

    fun getPopular(size: Int): List<ArticleListResponse> {
        val pageable = PageRequest.of(0, size)
        return articleRepository.findPopular(pageable).content.map {
            DtoMapper.toArticleListResponse(it)
        }
    }

    @Transactional
    fun create(request: CreateArticleRequest, author: User): ArticleResponse {
        val category = request.categoryId?.let { categoryRepository.findById(it).orElse(null) }
        val tags = if (request.tagIds.isNotEmpty()) {
            tagRepository.findAllById(request.tagIds).toSet()
        } else emptySet()

        val slug = request.title.lowercase()
            .replace(Regex("[^a-z0-9\\s-]"), "")
            .replace(Regex("\\s+"), "-")
            .take(300)

        val article = articleRepository.save(
            Article(
                title = request.title,
                slug = slug,
                summary = request.summary,
                content = request.content,
                author = author,
                category = category,
                tags = tags
            )
        )
        return DtoMapper.toArticleResponse(article)
    }

    fun countPublished(): Long = articleRepository.countByStatus("PUBLISHED")
}
