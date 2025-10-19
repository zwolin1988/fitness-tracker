// src/lib/api/auth.ts
// Authentication API functions

import type { LoginCredentials, RegisterCredentials } from "@/lib/schemas/auth";
import { apiRequest } from "./client";

/**
 * Response from successful login
 */
export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Response from successful registration
 */
export interface RegisterResponse {
  success: boolean;
  requiresEmailVerification?: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Response from password reset request
 */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Response from password reset
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/**
 * Register new user
 */
export async function register(
  credentials: RegisterCredentials & { confirmPassword?: string }
): Promise<RegisterResponse> {
  // Remove confirmPassword from the payload (not sent to server)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...payload } = credentials;
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Request password reset (send email with reset link)
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using token from email
 */
export async function resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await apiRequest("/api/auth/logout", {
    method: "POST",
  });
}
