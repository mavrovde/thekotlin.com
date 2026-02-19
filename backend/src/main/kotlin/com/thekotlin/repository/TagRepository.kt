package com.thekotlin.repository

import com.thekotlin.model.Tag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TagRepository : JpaRepository<Tag, Long> {
    fun findBySlug(slug: String): Tag?
}
