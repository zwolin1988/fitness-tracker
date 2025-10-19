// src/components/auth/RegisterForm.tsx
// Formularz rejestracji z walidacją

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { register as registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { RegisterWithConfirmSchema, type RegisterWithConfirmCredentials } from "@/lib/schemas/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterFormProps {
  /**
   * URL docelowy po rejestracji (opcjonalny, domyślnie /dashboard)
   */
  redirectUrl?: string;
}

/**
 * Formularz rejestracji
 * Integracja z Supabase Auth przez API endpoint /api/auth/register
 */
export function RegisterForm({ redirectUrl = "/dashboard" }: RegisterFormProps) {
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
    setError,
  } = useForm<RegisterWithConfirmCredentials>({
    resolver: zodResolver(RegisterWithConfirmSchema),
    mode: "onTouched",
  });

  /**
   * Obsługa submit
   */
  const onSubmit = async (data: RegisterWithConfirmCredentials) => {
    setGlobalError("");

    try {
      const response = await registerUser(data);

      // Success - if email verification required, show message
      if (response.requiresEmailVerification) {
        // Show success message before redirecting to login
        alert(response.message);
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = "/auth/login";
      } else {
        // Auto-logged in - redirect to target URL
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = redirectUrl;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle validation errors (422)
        if (error.isValidationError() && error.fieldErrors) {
          // Set field-specific errors
          Object.entries(error.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof RegisterWithConfirmCredentials, {
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
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>Stwórz nowe konto i zacznij śledzić swoje treningi</CardDescription>
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
            />
            {errors.email && touchedFields.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Imię */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-foreground">
              Imię <span className="text-primary">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jan Kowalski"
              {...register("name")}
              disabled={isSubmitting}
              className={`h-12 ${errors.name && touchedFields.name ? "border-destructive" : ""}`}
              aria-invalid={errors.name && touchedFields.name ? "true" : "false"}
              aria-describedby={errors.name && touchedFields.name ? "name-error" : undefined}
            />
            {errors.name && touchedFields.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Waga i Wzrost - grid 2 kolumny */}
          <div className="grid grid-cols-2 gap-4">
            {/* Waga */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="font-medium text-foreground">
                Waga (kg) <span className="text-primary">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70"
                {...register("weight", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={`h-12 ${errors.weight && touchedFields.weight ? "border-destructive" : ""}`}
                aria-invalid={errors.weight && touchedFields.weight ? "true" : "false"}
                aria-describedby={errors.weight && touchedFields.weight ? "weight-error" : undefined}
              />
              {errors.weight && touchedFields.weight && (
                <p id="weight-error" className="text-sm text-destructive">
                  {errors.weight.message}
                </p>
              )}
            </div>

            {/* Wzrost */}
            <div className="space-y-2">
              <Label htmlFor="height" className="font-medium text-foreground">
                Wzrost (cm) <span className="text-primary">*</span>
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="180"
                {...register("height", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={`h-12 ${errors.height && touchedFields.height ? "border-destructive" : ""}`}
                aria-invalid={errors.height && touchedFields.height ? "true" : "false"}
                aria-describedby={errors.height && touchedFields.height ? "height-error" : undefined}
              />
              {errors.height && touchedFields.height && (
                <p id="height-error" className="text-sm text-destructive">
                  {errors.height.message}
                </p>
              )}
            </div>
          </div>

          {/* Hasło */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-foreground">
              Hasło <span className="text-primary">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isSubmitting}
              className={`h-12 ${errors.password && touchedFields.password ? "border-destructive" : ""}`}
              aria-invalid={errors.password && touchedFields.password ? "true" : "false"}
              aria-describedby={errors.password && touchedFields.password ? "password-error" : undefined}
            />
            {errors.password && touchedFields.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Potwierdzenie hasła */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium text-foreground">
              Powtórz hasło <span className="text-primary">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isSubmitting}
              className={`h-12 ${errors.confirmPassword && touchedFields.confirmPassword ? "border-destructive" : ""}`}
              aria-invalid={errors.confirmPassword && touchedFields.confirmPassword ? "true" : "false"}
              aria-describedby={
                errors.confirmPassword && touchedFields.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tworzenie konta...
              </>
            ) : (
              "Zarejestruj się"
            )}
          </Button>

          {/* Link do logowania */}
          <div className="text-center text-sm text-muted-foreground">
            Masz już konto?{" "}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Zaloguj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
