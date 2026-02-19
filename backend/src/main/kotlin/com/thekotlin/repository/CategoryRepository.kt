package com.thekotlin.repository

import com.thekotlin.model.Category
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<Category, Long> {
    fun findBySlug(slug: String): Category?
    fun findAllByOrderBySortOrderAsc(): List<Category>
}
