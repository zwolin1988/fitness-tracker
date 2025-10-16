// src/components/auth/ResetPasswordForm.tsx
// Formularz do ustawiania nowego hasła (po kliknięciu w link z e-maila)

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema walidacji hasła
const PasswordSchema = z.string().min(6, "Hasło musi mieć minimum 6 znaków");

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

interface ResetPasswordFormErrors {
  password?: string;
  confirmPassword?: string;
}

/**
 * Formularz resetowania hasła
 * TODO: Integracja z Supabase zostanie dodana w kolejnym etapie
 */
export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Walidacja hasła
   */
  const validatePassword = (password: string): string | undefined => {
    const result = PasswordSchema.safeParse(password);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja potwierdzenia hasła
   */
  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) {
      return "Potwierdzenie hasła jest wymagane";
    }
    if (password !== confirmPassword) {
      return "Hasła nie są identyczne";
    }
    return undefined;
  };

  /**
   * Walidacja formularza
   */
  const validateForm = (): boolean => {
    const newErrors: ResetPasswordFormErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  /**
   * Obsługa zmiany hasła
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setGlobalError("");

    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(newPassword),
      }));
    }

    // Re-validate confirmPassword if it's already touched
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
      }));
    }
  };

  /**
   * Obsługa zmiany potwierdzenia hasła
   */
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setGlobalError("");

    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, newConfirmPassword),
      }));
    }
  };

  /**
   * Obsługa blur
   */
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
      }));
    } else if (field === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, confirmPassword),
      }));
    }
  };

  /**
   * Obsługa submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setTouched({ password: true, confirmPassword: true });

    if (!validateForm()) {
      return;
    }

    // Sprawdź czy mamy token
    if (!token) {
      setGlobalError("Brak tokenu resetowania hasła. Link może być nieprawidłowy lub wygasły.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integracja z Supabase - będzie dodana w kolejnym etapie
      // Wywołanie: supabase.auth.updateUser({ password })
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sukces
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              disabled={isLoading}
              className={`h-12 ${errors.password && touched.password ? "border-destructive" : ""}`}
              aria-invalid={errors.password && touched.password ? "true" : "false"}
              aria-describedby={errors.password && touched.password ? "password-error" : undefined}
            />
            {errors.password && touched.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
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
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() => handleBlur("confirmPassword")}
              disabled={isLoading}
              className={`h-12 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive" : ""}`}
              aria-invalid={errors.confirmPassword && touched.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword && touched.confirmPassword ? "confirmPassword-error" : undefined}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? (
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
