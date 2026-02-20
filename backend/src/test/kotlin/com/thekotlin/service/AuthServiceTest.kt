package com.thekotlin.service

import com.thekotlin.config.JwtUtil
import com.thekotlin.dto.LoginRequest
import com.thekotlin.dto.RegisterRequest
import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.repository.UserRepository
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.password.PasswordEncoder

class AuthServiceTest {

    private val userRepository = mockk<UserRepository>()
    private val passwordEncoder = mockk<PasswordEncoder>()
    private val jwtUtil = mockk<JwtUtil>()
    private val authService = AuthService(userRepository, passwordEncoder, jwtUtil)

    private val testUser = User(
        id = 1, username = "testuser", email = "test@test.com",
        passwordHash = "encoded_hash", displayName = "Test User", role = UserRole.USER
    )

    @Test
    fun `register - happy path creates user and returns token`() {
        val request = RegisterRequest("newuser", "new@test.com", "password123", "New User")

        every { userRepository.existsByUsername("newuser") } returns false
        every { userRepository.existsByEmail("new@test.com") } returns false
        every { passwordEncoder.encode("password123") } returns "encoded_pwd"
        every { userRepository.save(any()) } returns testUser.copy(username = "newuser")
        every { jwtUtil.generateToken("newuser") } returns "jwt_token"

        val result = authService.register(request)

        assertEquals("jwt_token", result.token)
        assertNotNull(result.user)
        verify { userRepository.save(any()) }
    }

    @Test
    fun `register - duplicate username throws IllegalArgumentException`() {
        every { userRepository.existsByUsername("existing") } returns true

        val ex = assertThrows<IllegalArgumentException> {
            authService.register(RegisterRequest("existing", "new@test.com", "pass"))
        }
        assertEquals("Username already exists", ex.message)
    }

    @Test
    fun `register - duplicate email throws IllegalArgumentException`() {
        every { userRepository.existsByUsername("newuser") } returns false
        every { userRepository.existsByEmail("existing@test.com") } returns true

        val ex = assertThrows<IllegalArgumentException> {
            authService.register(RegisterRequest("newuser", "existing@test.com", "pass"))
        }
        assertEquals("Email already exists", ex.message)
    }

    @Test
    fun `register - displayName defaults to username when null`() {
        val request = RegisterRequest("autoname", "auto@test.com", "pass", null)

        every { userRepository.existsByUsername("autoname") } returns false
        every { userRepository.existsByEmail("auto@test.com") } returns false
        every { passwordEncoder.encode("pass") } returns "hash"
        every { jwtUtil.generateToken("autoname") } returns "token"

        val savedUser = slot<User>()
        every { userRepository.save(capture(savedUser)) } returns testUser.copy(
            username = "autoname", displayName = "autoname"
        )

        authService.register(request)
        assertEquals("autoname", savedUser.captured.displayName)
    }

    @Test
    fun `login - happy path returns token`() {
        every { userRepository.findByUsername("testuser") } returns testUser
        every { passwordEncoder.matches("correct_pass", "encoded_hash") } returns true
        every { jwtUtil.generateToken("testuser") } returns "login_token"

        val result = authService.login(LoginRequest("testuser", "correct_pass"))

        assertEquals("login_token", result.token)
        assertEquals("testuser", result.user.username)
    }

    @Test
    fun `login - user not found throws IllegalArgumentException`() {
        every { userRepository.findByUsername("ghost") } returns null

        val ex = assertThrows<IllegalArgumentException> {
            authService.login(LoginRequest("ghost", "pass"))
        }
        assertEquals("Invalid credentials", ex.message)
    }

    @Test
    fun `login - wrong password throws IllegalArgumentException`() {
        every { userRepository.findByUsername("testuser") } returns testUser
        every { passwordEncoder.matches("wrong_pass", "encoded_hash") } returns false

        val ex = assertThrows<IllegalArgumentException> {
            authService.login(LoginRequest("testuser", "wrong_pass"))
        }
        assertEquals("Invalid credentials", ex.message)
    }
}
