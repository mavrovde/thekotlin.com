package com.thekotlin.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "forum_threads")
data class ForumThread(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 300)
    val title: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    val author: User = User(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    val category: Category? = null,

    @Column(name = "is_pinned", nullable = false)
    val isPinned: Boolean = false,

    @Column(name = "is_locked", nullable = false)
    val isLocked: Boolean = false,

    @Column(name = "view_count", nullable = false)
    val viewCount: Int = 0,

    @OneToMany(mappedBy = "thread", fetch = FetchType.LAZY)
    val posts: List<ForumPost> = emptyList(),

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)
