package com.thekotlin.config

import com.thekotlin.model.User
import com.thekotlin.model.UserRole
import com.thekotlin.repository.UserRepository
import io.mockk.*
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder

class JwtAuthFilterTest {

    private val jwtUtil = mockk<JwtUtil>()
    private val userRepository = mockk<UserRepository>()
    private val filter = JwtAuthFilter(jwtUtil, userRepository)
    private val filterChain = mockk<FilterChain>(relaxed = true)

    @BeforeEach
    fun setUp() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `no Authorization header - filter passes without auth`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `header without Bearer prefix - no auth set`() {
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Basic abc123")
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `valid Bearer token and user exists - SecurityContext populated`() {
        val user = User(id = 1, username = "testuser", email = "test@test.com", passwordHash = "hash", role = UserRole.USER)
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer valid_token")
        val response = MockHttpServletResponse()

        every { jwtUtil.getUsernameFromToken("valid_token") } returns "testuser"
        every { userRepository.findByUsername("testuser") } returns user

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        val auth = SecurityContextHolder.getContext().authentication
        assertNotNull(auth)
        assertEquals(user, auth?.principal)
    }

    @Test
    fun `valid token but user not in DB - no auth set`() {
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer valid_token")
        val response = MockHttpServletResponse()

        every { jwtUtil.getUsernameFromToken("valid_token") } returns "ghostuser"
        every { userRepository.findByUsername("ghostuser") } returns null

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `invalid JWT token - no auth set`() {
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer bad_jwt")
        val response = MockHttpServletResponse()

        every { jwtUtil.getUsernameFromToken("bad_jwt") } returns null

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `valid token but auth already exists - no overwrite`() {
        val existingAuth = mockk<org.springframework.security.core.Authentication>()
        SecurityContextHolder.getContext().authentication = existingAuth

        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer valid_token")
        val response = MockHttpServletResponse()

        every { jwtUtil.getUsernameFromToken("valid_token") } returns "testuser"

        filter.doFilter(request, response, filterChain)

        verify { filterChain.doFilter(request, response) }
        // Should NOT have tried to look up user
        verify(exactly = 0) { userRepository.findByUsername(any()) }
        assertEquals(existingAuth, SecurityContextHolder.getContext().authentication)
    }
}
