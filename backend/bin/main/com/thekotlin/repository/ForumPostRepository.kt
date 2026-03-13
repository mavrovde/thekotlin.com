package com.thekotlin.repository

import com.thekotlin.model.ForumPost
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ForumPostRepository : JpaRepository<ForumPost, Long> {
    fun findByThreadIdOrderByCreatedAtAsc(threadId: Long, pageable: Pageable): Page<ForumPost>
    fun countByThreadId(threadId: Long): Long
}
