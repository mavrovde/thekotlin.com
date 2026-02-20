package com.thekotlin.controller

import com.thekotlin.dto.AuthResponse
import com.thekotlin.dto.LoginRequest
import com.thekotlin.dto.RegisterRequest
import com.thekotlin.dto.UserResponse
import com.thekotlin.service.AuthService
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import java.time.LocalDateTime

class AuthControllerTest {

    private val authService = mockk<AuthService>()
    private val controller = AuthController(authService)

    private val userResponse = UserResponse(
        id = 1, username = "testuser", email = "test@test.com",
        displayName = "Test", bio = null, avatarUrl = null,
        role = "USER", createdAt = LocalDateTime.now()
    )
    private val authResponse = AuthResponse(token = "jwt_token", user = userResponse)

    @Test
    fun `register - success returns 201 CREATED`() {
        val request = RegisterRequest("newuser", "new@test.com", "pass")
        every { authService.register(request) } returns authResponse

        val result = controller.register(request)

        assertEquals(HttpStatus.CREATED, result.statusCode)
    }

    @Test
    fun `register - duplicate returns 400 BAD REQUEST`() {
        val request = RegisterRequest("existing", "e@test.com", "pass")
        every { authService.register(request) } throws IllegalArgumentException("Username already exists")

        val result = controller.register(request)

        assertEquals(HttpStatus.BAD_REQUEST, result.statusCode)
        @Suppress("UNCHECKED_CAST")
        val body = result.body as Map<String, String?>
        assertEquals("Username already exists", body["error"])
    }

    @Test
    fun `login - success returns 200 OK`() {
        val request = LoginRequest("testuser", "pass")
        every { authService.login(request) } returns authResponse

        val result = controller.login(request)

        assertEquals(HttpStatus.OK, result.statusCode)
    }

    @Test
    fun `login - bad credentials returns 401 UNAUTHORIZED`() {
        val request = LoginRequest("testuser", "wrongpass")
        every { authService.login(request) } throws IllegalArgumentException("Invalid credentials")

        val result = controller.login(request)

        assertEquals(HttpStatus.UNAUTHORIZED, result.statusCode)
        @Suppress("UNCHECKED_CAST")
        val body = result.body as Map<String, String?>
        assertEquals("Invalid credentials", body["error"])
    }
}
