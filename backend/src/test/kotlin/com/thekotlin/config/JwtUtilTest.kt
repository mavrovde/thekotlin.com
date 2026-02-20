package com.thekotlin.config

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class JwtUtilTest {

    // 256-bit secret (at least 32 bytes)
    private val jwtUtil = JwtUtil(
        secret = "TestSecretKeyThatIsAtLeast256BitsLongForHMACSHA!!",
        expirationMs = 3600000
    )

    @Test
    fun `generateToken produces valid JWT`() {
        val token = jwtUtil.generateToken("testuser")
        assertNotNull(token)
        assertTrue(token.split(".").size == 3) // header.payload.signature
    }

    @Test
    fun `getUsernameFromToken extracts correct username`() {
        val token = jwtUtil.generateToken("kotlin_dev")
        val username = jwtUtil.getUsernameFromToken(token)
        assertEquals("kotlin_dev", username)
    }

    @Test
    fun `getUsernameFromToken returns null for invalid token`() {
        assertNull(jwtUtil.getUsernameFromToken("invalid.token.here"))
    }

    @Test
    fun `getUsernameFromToken returns null for tampered token`() {
        val token = jwtUtil.generateToken("user1")
        val tampered = token.dropLast(5) + "XXXXX"
        assertNull(jwtUtil.getUsernameFromToken(tampered))
    }

    @Test
    fun `getUsernameFromToken returns null for expired token`() {
        val expiredJwtUtil = JwtUtil(
            secret = "TestSecretKeyThatIsAtLeast256BitsLongForHMACSHA!!",
            expirationMs = -1000 // already expired
        )
        val token = expiredJwtUtil.generateToken("expired_user")
        assertNull(expiredJwtUtil.getUsernameFromToken(token))
    }

    @Test
    fun `validateToken returns true for valid token`() {
        val token = jwtUtil.generateToken("valid_user")
        assertTrue(jwtUtil.validateToken(token))
    }

    @Test
    fun `validateToken returns false for invalid token`() {
        assertFalse(jwtUtil.validateToken("bad.token.value"))
    }
}
