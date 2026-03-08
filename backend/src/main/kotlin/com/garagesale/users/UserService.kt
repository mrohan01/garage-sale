package com.garagesale.users

import com.garagesale.common.dto.UpdateProfileRequest
import com.garagesale.common.dto.UserProfileResponse
import com.garagesale.common.exceptions.NotFoundException
import com.garagesale.reviews.ReviewRepository
import com.garagesale.trust.TrustScoreRepository
import jakarta.inject.Singleton
import java.time.Instant
import java.util.UUID

@Singleton
class UserService(
    private val userRepository: UserRepository,
    private val trustScoreRepository: TrustScoreRepository,
    private val reviewRepository: ReviewRepository
) {
    fun getProfile(userId: UUID): UserProfileResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val trust = trustScoreRepository.findById(userId).orElse(null)
        val reviews = reviewRepository.findBySellerId(userId)
        val avgRating = if (reviews.isNotEmpty()) reviews.map { it.rating }.average() else null
        return UserProfileResponse(
            id = user.id.toString(), email = user.email, displayName = user.displayName,
            avatarUrl = user.avatarUrl, trustScore = trust?.score, reviewCount = reviews.size,
            avgRating = avgRating, createdAt = user.createdAt
        )
    }

    fun getPublicProfile(userId: UUID): UserProfileResponse = getProfile(userId).copy(email = null)

    fun updateProfile(userId: UUID, request: UpdateProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val updated = user.copy(
            displayName = request.displayName ?: user.displayName,
            avatarUrl = request.avatarUrl ?: user.avatarUrl,
            updatedAt = Instant.now()
        )
        userRepository.update(updated)
        return getProfile(userId)
    }
}
