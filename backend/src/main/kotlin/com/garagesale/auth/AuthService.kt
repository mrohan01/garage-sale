package com.garagesale.auth

import com.garagesale.common.dto.AuthResponse
import com.garagesale.common.dto.LoginRequest
import com.garagesale.common.dto.RegisterRequest
import com.garagesale.trust.TrustService
import com.garagesale.users.User
import com.garagesale.users.UserRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class AuthService(
    private val userRepository: UserRepository,
    private val passwordService: PasswordService,
    private val jwtService: JwtService,
    private val trustService: TrustService
) {
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email already registered")
        }
        val user = userRepository.save(User(
            id = UUID.randomUUID(),
            email = request.email,
            passwordHash = passwordService.hash(request.password),
            displayName = request.displayName,
            avatarUrl = null,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        ))
        trustService.initializeScore(user.id)
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseThrow { IllegalArgumentException("Invalid credentials") }
        if (!passwordService.verify(request.password, user.passwordHash)) {
            throw IllegalArgumentException("Invalid credentials")
        }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }

    fun refresh(refreshToken: String): AuthResponse {
        val userId = jwtService.validateRefreshToken(refreshToken)
            ?: throw IllegalArgumentException("Invalid refresh token")
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        return AuthResponse(
            accessToken = jwtService.generateAccessToken(user.id),
            refreshToken = jwtService.generateRefreshToken(user.id),
            userId = user.id.toString()
        )
    }
}
