package com.thekotlin.repository

import com.thekotlin.model.Article
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface ArticleRepository : JpaRepository<Article, Long> {
    fun findBySlug(slug: String): Article?

    fun findByStatus(status: String, pageable: Pageable): Page<Article>

    fun findByCategorySlugAndStatus(categorySlug: String, status: String, pageable: Pageable): Page<Article>

    @Query("""
        SELECT a FROM Article a 
        WHERE a.status = 'PUBLISHED' 
        AND (LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) 
             OR LOWER(a.summary) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY a.createdAt DESC
    """)
    fun search(@Param("query") query: String, pageable: Pageable): Page<Article>

    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' ORDER BY a.viewCount DESC")
    fun findPopular(pageable: Pageable): Page<Article>

    fun countByStatus(status: String): Long
}
