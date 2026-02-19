package com.thekotlin.repository

import com.thekotlin.model.ForumThread
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ForumThreadRepository : JpaRepository<ForumThread, Long> {
    fun findAllByOrderByIsPinnedDescCreatedAtDesc(pageable: Pageable): Page<ForumThread>
    fun findByCategorySlug(categorySlug: String, pageable: Pageable): Page<ForumThread>
}
