package com.thekotlin.repository

import com.thekotlin.model.News
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository

interface NewsRepository : JpaRepository<News, Long> {
    fun findByIsPublishedTrueOrderByPublishedAtDesc(pageable: Pageable): Page<News>
    fun findBySlug(slug: String): News?
    fun findByTagAndIsPublishedTrue(tag: String, pageable: Pageable): Page<News>
    fun countByIsPublishedTrue(): Long
}
