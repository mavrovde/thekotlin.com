package com.thekotlin.service

import com.thekotlin.dto.*
import com.thekotlin.model.ForumPost
import com.thekotlin.model.ForumThread
import com.thekotlin.model.User
import com.thekotlin.repository.CategoryRepository
import com.thekotlin.repository.ForumPostRepository
import com.thekotlin.repository.ForumThreadRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ForumService(
    private val threadRepository: ForumThreadRepository,
    private val postRepository: ForumPostRepository,
    private val categoryRepository: CategoryRepository
) {

    fun listThreads(page: Int, size: Int, category: String?): PageResponse<ForumThreadResponse> {
        val pageable = PageRequest.of(page, size)

        val threads = if (category != null) {
            threadRepository.findByCategorySlug(category, pageable)
        } else {
            threadRepository.findAllByOrderByIsPinnedDescCreatedAtDesc(pageable)
        }

        return PageResponse(
            content = threads.content.map { thread ->
                ForumThreadResponse(
                    id = thread.id,
                    title = thread.title,
                    author = DtoMapper.toUserResponse(thread.author),
                    category = thread.category?.let { DtoMapper.toCategoryResponse(it) },
                    isPinned = thread.isPinned,
                    isLocked = thread.isLocked,
                    viewCount = thread.viewCount,
                    postCount = postRepository.countByThreadId(thread.id),
                    createdAt = thread.createdAt,
                    updatedAt = thread.updatedAt
                )
            },
            page = threads.number,
            size = threads.size,
            totalElements = threads.totalElements,
            totalPages = threads.totalPages
        )
    }

    fun getThread(id: Long, page: Int, size: Int): ForumThreadDetailResponse? {
        val thread = threadRepository.findById(id).orElse(null) ?: return null
        val posts = postRepository.findByThreadIdOrderByCreatedAtAsc(id, PageRequest.of(page, size))

        return ForumThreadDetailResponse(
            id = thread.id,
            title = thread.title,
            author = DtoMapper.toUserResponse(thread.author),
            category = thread.category?.let { DtoMapper.toCategoryResponse(it) },
            isPinned = thread.isPinned,
            isLocked = thread.isLocked,
            viewCount = thread.viewCount,
            posts = posts.content.map { DtoMapper.toForumPostResponse(it) },
            createdAt = thread.createdAt
        )
    }

    @Transactional
    fun createThread(request: CreateThreadRequest, author: User): ForumThreadResponse {
        val category = request.categoryId?.let { categoryRepository.findById(it).orElse(null) }

        val thread = threadRepository.save(
            ForumThread(title = request.title, author = author, category = category)
        )

        postRepository.save(
            ForumPost(content = request.content, author = author, thread = thread)
        )

        return ForumThreadResponse(
            id = thread.id,
            title = thread.title,
            author = DtoMapper.toUserResponse(thread.author),
            category = thread.category?.let { DtoMapper.toCategoryResponse(it) },
            isPinned = thread.isPinned,
            isLocked = thread.isLocked,
            viewCount = thread.viewCount,
            postCount = 1,
            createdAt = thread.createdAt,
            updatedAt = thread.updatedAt
        )
    }

    @Transactional
    fun createPost(threadId: Long, request: CreatePostRequest, author: User): ForumPostResponse? {
        val thread = threadRepository.findById(threadId).orElse(null) ?: return null

        if (thread.isLocked) {
            throw IllegalStateException("Thread is locked")
        }

        val parent = request.parentId?.let { postRepository.findById(it).orElse(null) }

        val post = postRepository.save(
            ForumPost(content = request.content, author = author, thread = thread, parent = parent)
        )
        return DtoMapper.toForumPostResponse(post)
    }

    fun countThreads(): Long = threadRepository.count()
}
