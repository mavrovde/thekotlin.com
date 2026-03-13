package com.thekotlin.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 50)
    val username: String = "",

    @Column(nullable = false, unique = true)
    val email: String = "",

    @Column(name = "password_hash", nullable = false)
    val passwordHash: String = "",

    @Column(name = "display_name", length = 100)
    val displayName: String? = null,

    @Column(columnDefinition = "TEXT")
    val bio: String? = null,

    @Column(name = "avatar_url", length = 500)
    val avatarUrl: String? = null,

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    val role: UserRole = UserRole.USER,

    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class UserRole {
    USER, AUTHOR, ADMIN
}
