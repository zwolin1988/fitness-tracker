// src/components/auth/ForgotPasswordForm.tsx
// Formularz do resetowania hasła (wysyłka linku e-mail)

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ForgotPasswordSchema, type ForgotPasswordCredentials } from "@/lib/schemas/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  /**
   * Callback po wysłaniu linku resetującego
   */
  onSuccess?: () => void;
}

/**
 * Formularz do resetowania hasła
 * TODO: Integracja z Supabase zostanie dodana w kolejnym etapie
 */
export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [globalError, setGlobalError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
    setError,
    reset,
  } = useForm<ForgotPasswordCredentials>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onTouched",
  });

  /**
   * Obsługa submit
   */
  const onSubmit = async (data: ForgotPasswordCredentials) => {
    setGlobalError("");

    try {
      await forgotPassword(data.email);

      // Success - show message
      setSuccessEmail(data.email);
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
            setError(field as keyof ForgotPasswordCredentials, {
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
          <CardTitle className="text-2xl">Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription>Link do resetowania hasła został wysłany</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Jeśli konto z adresem <strong>{successEmail}</strong> istnieje, wysłaliśmy link do resetowania hasła.
              Sprawdź swoją skrzynkę e-mail i postępuj zgodnie z instrukcjami.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Nie otrzymałeś e-maila?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sprawdź folder spam</li>
              <li>Upewnij się, że adres e-mail jest poprawny</li>
              <li>Odczekaj kilka minut i spróbuj ponownie</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="default"
              className="w-full h-12"
              onClick={() => {
                setIsSuccess(false);
                setSuccessEmail("");
                reset();
              }}
            >
              Wyślij ponownie
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12"
              onClick={() => (window.location.href = "/auth/login")}
            >
              Wróć do logowania
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Widok formularza
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Zapomniałeś hasła?</CardTitle>
        <CardDescription>Wyślemy Ci link do resetowania hasła</CardDescription>
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
            <p className="text-sm text-muted-foreground">Podaj adres e-mail użyty podczas rejestracji</p>
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              "Wyślij link resetujący"
            )}
          </Button>

          {/* Link powrotu */}
          <div className="text-center text-sm text-muted-foreground">
            Pamiętasz hasło?{" "}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Wróć do logowania
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
