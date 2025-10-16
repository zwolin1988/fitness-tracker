// src/components/auth/ForgotPasswordForm.tsx
// Formularz do resetowania hasła (wysyłka linku e-mail)

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema walidacji email
const EmailSchema = z.string().email("Nieprawidłowy format adresu email").trim();

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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Walidacja email
   */
  const validateEmail = (email: string): string | undefined => {
    const result = EmailSchema.safeParse(email);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Obsługa zmiany email
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setGlobalError("");

    if (touched) {
      setError(validateEmail(newEmail) || "");
    }
  };

  /**
   * Obsługa blur
   */
  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email) || "");
  };

  /**
   * Obsługa submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setTouched(true);

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integracja z Supabase - będzie dodana w kolejnym etapie
      // Wywołanie: supabase.auth.resetPasswordForEmail(email)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sukces - pokaż komunikat
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setGlobalError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      setIsLoading(false);
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
              Jeśli konto z adresem <strong>{email}</strong> istnieje, wysłaliśmy link do resetowania hasła. Sprawdź
              swoją skrzynkę e-mail i postępuj zgodnie z instrukcjami.
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
                setEmail("");
                setTouched(false);
                setError("");
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`h-12 ${error && touched ? "border-destructive" : ""}`}
              aria-invalid={error && touched ? "true" : "false"}
              aria-describedby={error && touched ? "email-error" : undefined}
            />
            {error && touched && (
              <p id="email-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Podaj adres e-mail użyty podczas rejestracji</p>
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? (
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
