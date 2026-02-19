package com.thekotlin.service

import com.thekotlin.config.JwtUtil
import com.thekotlin.dto.AuthResponse
import com.thekotlin.dto.LoginRequest
import com.thekotlin.dto.RegisterRequest
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil
) {

    fun register(request: RegisterRequest): AuthResponse {
        require(!userRepository.existsByUsername(request.username)) { "Username already exists" }
        require(!userRepository.existsByEmail(request.email)) { "Email already exists" }

        val user = userRepository.save(
            User(
                username = request.username,
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                displayName = request.displayName ?: request.username,
                role = UserRole.USER
            )
        )

        val token = jwtUtil.generateToken(user.username)
        return AuthResponse(token = token, user = DtoMapper.toUserResponse(user))
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByUsername(request.username)
            ?: throw IllegalArgumentException("Invalid credentials")

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials")
        }

        val token = jwtUtil.generateToken(user.username)
        return AuthResponse(token = token, user = DtoMapper.toUserResponse(user))
    }
}
