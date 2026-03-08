package com.garagesale.auth

import com.garagesale.common.dto.*
import io.micronaut.http.HttpResponse
import io.micronaut.http.annotation.Body
import io.micronaut.http.annotation.Controller
import io.micronaut.http.annotation.Post

@Controller("/api/auth")
class AuthController(private val authService: AuthService) {

    @Post("/register")
    fun register(@Body request: RegisterRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.created(ApiResponse(authService.register(request)))

    @Post("/login")
    fun login(@Body request: LoginRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.login(request)))

    @Post("/refresh")
    fun refresh(@Body request: RefreshRequest): HttpResponse<ApiResponse<AuthResponse>> =
        HttpResponse.ok(ApiResponse(authService.refresh(request.refreshToken)))
}
