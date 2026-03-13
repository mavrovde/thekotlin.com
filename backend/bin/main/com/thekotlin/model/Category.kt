package com.thekotlin.model

import jakarta.persistence.*

@Entity
@Table(name = "categories")
data class Category(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val name: String = "",

    @Column(nullable = false, unique = true, length = 100)
    val slug: String = "",

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Column(length = 50)
    val icon: String? = null,

    @Column(name = "sort_order", nullable = false)
    val sortOrder: Int = 0
)
