package com.thekotlin.service

import com.thekotlin.dto.*
import com.thekotlin.model.News
import com.thekotlin.model.User
import com.thekotlin.repository.NewsRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class NewsService(
    private val newsRepository: NewsRepository
) {

    fun listNews(page: Int, size: Int, tag: String?): PageResponse<NewsResponse> {
        val pageable = PageRequest.of(page, size)
        val newsPage = if (tag != null) {
            newsRepository.findByTagAndIsPublishedTrue(tag, pageable)
        } else {
            newsRepository.findByIsPublishedTrueOrderByPublishedAtDesc(pageable)
        }
        return PageResponse(
            content = newsPage.content.map { toNewsResponse(it) },
            page = page,
            size = size,
            totalElements = newsPage.totalElements,
            totalPages = newsPage.totalPages
        )
    }

    fun getBySlug(slug: String): NewsResponse? {
        return newsRepository.findBySlug(slug)?.let { toNewsResponse(it) }
    }

    fun create(request: CreateNewsRequest, user: User): NewsResponse {
        val slug = request.title
            .lowercase()
            .replace(Regex("[^a-z0-9\\s-]"), "")
            .replace(Regex("\\s+"), "-")
            .take(300)
        val news = newsRepository.save(
            News(
                title = request.title,
                slug = slug,
                summary = request.summary,
                content = request.content,
                tag = request.tag,
                tagColor = request.tagColor ?: "#7F52FF",
                sourceUrl = request.sourceUrl,
                author = user,
                publishedAt = LocalDateTime.now()
            )
        )
        return toNewsResponse(news)
    }

    fun countPublished(): Long = newsRepository.countByIsPublishedTrue()

    private fun toNewsResponse(news: News) = NewsResponse(
        id = news.id,
        title = news.title,
        slug = news.slug,
        summary = news.summary,
        content = news.content,
        tag = news.tag,
        tagColor = news.tagColor,
        sourceUrl = news.sourceUrl,
        author = news.author?.let { DtoMapper.toUserResponse(it) },
        publishedAt = news.publishedAt,
        createdAt = news.createdAt,
        updatedAt = news.updatedAt
    )
}
