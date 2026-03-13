package com.thekotlin.model

import jakarta.persistence.*

@Entity
@Table(name = "tags")
data class Tag(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 50)
    val name: String = "",

    @Column(nullable = false, unique = true, length = 50)
    val slug: String = ""
)
