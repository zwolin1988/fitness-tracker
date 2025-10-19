// src/lib/api/client.ts
// API client utilities and error handling

/**
 * Custom API Error class with structured error information
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly status: number;

  /**
   * Field-specific validation errors (for 422 responses)
   */
  public readonly fieldErrors?: Record<string, string[]>;

  /**
   * Additional error details
   */
  public readonly details?: unknown;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is a validation error (422)
   */
  isValidationError(): boolean {
    return this.status === 422;
  }

  /**
   * Check if error is an authentication error (401)
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(field: string): string | undefined {
    return this.fieldErrors?.[field]?.[0];
  }
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract field errors if present (422 validation errors)
      const fieldErrors = response.status === 422 && data.details ? data.details : undefined;

      throw new ApiError(
        data.error || "Wystąpił błąd podczas przetwarzania żądania",
        response.status,
        fieldErrors,
        data.details
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap network errors and other unexpected errors
    throw new ApiError("Wystąpił nieoczekiwany błąd. Sprawdź połączenie z internetem i spróbuj ponownie.", 0);
  }
}
