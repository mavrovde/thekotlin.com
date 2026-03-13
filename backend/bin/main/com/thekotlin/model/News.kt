package com.thekotlin.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "news")
data class News(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 300)
    val title: String = "",

    @Column(nullable = false, unique = true, length = 300)
    val slug: String = "",

    @Column(columnDefinition = "TEXT")
    val summary: String? = null,

    @Column(columnDefinition = "TEXT")
    val content: String? = null,

    @Column(nullable = false, length = 50)
    val tag: String = "General",

    @Column(name = "tag_color", nullable = false, length = 7)
    val tagColor: String = "#7F52FF",

    @Column(name = "source_url", length = 500)
    val sourceUrl: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    val author: User? = null,

    @Column(name = "is_published", nullable = false)
    val isPublished: Boolean = true,

    @Column(name = "published_at", nullable = false)
    val publishedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
