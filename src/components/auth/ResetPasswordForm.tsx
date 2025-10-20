// src/components/auth/ResetPasswordForm.tsx
// Formularz do ustawiania nowego hasła (po kliknięciu w link z e-maila)

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ResetPasswordSchema, type ResetPasswordCredentials } from "@/lib/schemas/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordFormProps {
  /**
   * Token resetowania hasła (z URL)
   */
  token?: string;
  /**
   * Callback po udanej zmianie hasła
   */
  onSuccess?: () => void;
}

/**
 * Formularz resetowania hasła
 * TODO: Integracja z Supabase zostanie dodana w kolejnym etapie
 */
export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [globalError, setGlobalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
    setError,
  } = useForm<ResetPasswordCredentials>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onTouched",
  });

  /**
   * Obsługa submit
   */
  const onSubmit = async (data: ResetPasswordCredentials) => {
    setGlobalError("");

    // Check if we have token
    if (!token) {
      setGlobalError("Brak tokenu resetowania hasła. Link może być nieprawidłowy lub wygasły.");
      return;
    }

    try {
      await resetPassword(token, data.password);

      // Success
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle validation errors (422)
        if (error.isValidationError() && error.fieldErrors) {
          // Set field-specific errors
          Object.entries(error.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ResetPasswordCredentials, {
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
        setGlobalError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      }
    }
  };

  // Widok sukcesu
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Hasło zostało zmienione</CardTitle>
          <CardDescription>Możesz teraz zalogować się używając nowego hasła</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Twoje hasło zostało pomyślnie zaktualizowane. Teraz możesz się zalogować.
            </AlertDescription>
          </Alert>

          <Button type="button" className="w-full h-12" onClick={() => (window.location.href = "/auth/login")}>
            Przejdź do logowania
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Widok formularza
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Ustaw nowe hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
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

          {/* Nowe hasło */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-foreground">
              Nowe hasło <span className="text-primary">*</span>
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
            <p className="text-sm text-muted-foreground">Hasło musi mieć minimum 6 znaków</p>
          </div>

          {/* Potwierdzenie hasła */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium text-foreground">
              Powtórz nowe hasło <span className="text-primary">*</span>
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
                Zapisywanie...
              </>
            ) : (
              "Zmień hasło"
            )}
          </Button>

          {/* Link powrotu */}
          <div className="text-center text-sm text-muted-foreground">
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Wróć do logowania
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
