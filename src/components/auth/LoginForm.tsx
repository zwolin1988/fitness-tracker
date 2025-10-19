// src/components/auth/LoginForm.tsx
// Login form component with Supabase authentication

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { LoginSchema, type LoginCredentials } from "@/lib/schemas/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  /**
   * URL docelowy po zalogowaniu (opcjonalny, domyślnie /dashboard)
   */
  redirectUrl?: string;
}

/**
 * Formularz logowania
 * Integracja z Supabase Auth przez API endpoint /api/auth/login
 */
export function LoginForm({ redirectUrl = "/dashboard" }: LoginFormProps) {
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
    setError,
  } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  /**
   * Obsługa submit formularza
   */
  const onSubmit = async (data: LoginCredentials) => {
    setGlobalError("");

    try {
      await login(data);
      // Success - redirect to target URL
      // eslint-disable-next-line react-compiler/react-compiler
      window.location.href = redirectUrl;
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle validation errors (422)
        if (error.isValidationError() && error.fieldErrors) {
          // Set field-specific errors
          Object.entries(error.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof LoginCredentials, {
              type: "server",
              message: messages[0],
            });
          });
          return;
        }

        // Handle other API errors
        setGlobalError(error.message);
      } else {
        // Handle unexpected errors
        setGlobalError("Wystąpił nieoczekiwany błąd. Sprawdź połączenie z internetem i spróbuj ponownie.");
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Logowanie</CardTitle>
        <CardDescription>Zaloguj się do swojego konta Fitness Tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Globalny błąd */}
          {globalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-foreground">
              Email <span className="text-primary">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              {...register("email")}
              disabled={isSubmitting}
              className={`h-12 ${errors.email && touchedFields.email ? "border-destructive" : ""}`}
              aria-invalid={errors.email && touchedFields.email ? "true" : "false"}
              aria-describedby={errors.email && touchedFields.email ? "email-error" : undefined}
              data-testid="login-email-input"
            />
            {errors.email && touchedFields.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Hasło */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-medium text-foreground">
                Hasło <span className="text-primary">*</span>
              </Label>
              <a href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Zapomniałeś hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
              className={`h-12 ${errors.password && touchedFields.password ? "border-destructive" : ""}`}
              aria-invalid={errors.password && touchedFields.password ? "true" : "false"}
              aria-describedby={errors.password && touchedFields.password ? "password-error" : undefined}
              data-testid="login-password-input"
            />
            {errors.password && touchedFields.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isSubmitting} data-testid="login-submit-button">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logowanie...
              </>
            ) : (
              "Zaloguj się"
            )}
          </Button>

          {/* Link do rejestracji */}
          <div className="text-center text-sm text-muted-foreground">
            Nie masz konta?{" "}
            <a
              href="/auth/register"
              className="text-primary hover:underline font-medium"
              data-testid="login-register-link"
            >
              Zarejestruj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
