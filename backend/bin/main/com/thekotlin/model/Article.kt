package com.thekotlin.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "articles")
data class Article(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 300)
    val title: String = "",

    @Column(nullable = false, unique = true, length = 300)
    val slug: String = "",

    @Column(columnDefinition = "TEXT")
    val summary: String? = null,

    @Column(nullable = false, columnDefinition = "TEXT")
    val content: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    val author: User = User(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    val category: Category? = null,

    @Column(nullable = false, length = 20)
    val status: String = "PUBLISHED",

    @Column(name = "view_count", nullable = false)
    val viewCount: Int = 0,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "article_tags",
        joinColumns = [JoinColumn(name = "article_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    val tags: Set<Tag> = emptySet(),

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
