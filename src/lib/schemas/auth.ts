// src/lib/schemas/auth.ts
// Zod validation schemas for authentication

import { z } from "zod";

/**
 * Schema for login credentials
 * - email: must be valid email format
 * - password: required, min 6 characters
 */
export const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

/**
 * Schema for registration
 * - email: must be valid email format
 * - password: min 6 characters
 * - name: required for profile
 * - weight: must be positive number
 * - height: must be positive number
 */
export const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
  name: z.string().min(1, "Imię jest wymagane").trim(),
  weight: z.number().positive("Waga musi być większa od 0"),
  height: z.number().positive("Wzrost musi być większy od 0"),
});

export type RegisterCredentials = z.infer<typeof RegisterSchema>;

/**
 * Schema for registration with password confirmation
 * Uses .refine() to validate password matching
 */
export const RegisterWithConfirmSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

export type RegisterWithConfirmCredentials = z.infer<typeof RegisterWithConfirmSchema>;

/**
 * Schema for password reset
 * - password: min 6 characters
 */
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type ResetPasswordCredentials = z.infer<typeof ResetPasswordSchema>;

/**
 * Schema for forgot password (email only)
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
});

export type ForgotPasswordCredentials = z.infer<typeof ForgotPasswordSchema>;
