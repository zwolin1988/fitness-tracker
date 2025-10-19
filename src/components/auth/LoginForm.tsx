// src/components/auth/LoginForm.tsx
// Login form component with Supabase authentication

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { LoginSchema } from "@/lib/schemas/auth";
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

interface LoginFormErrors {
  email?: string;
  password?: string;
}

/**
 * Formularz logowania
 * Integracja z Supabase Auth przez API endpoint /api/auth/login
 */
export function LoginForm({ redirectUrl = "/dashboard" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Walidacja pola email
   */
  const validateEmail = (email: string): string | undefined => {
    const result = LoginSchema.shape.email.safeParse(email);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja pola hasło
   */
  const validatePassword = (password: string): string | undefined => {
    const result = LoginSchema.shape.password.safeParse(password);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja całego formularza
   */
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  /**
   * Obsługa zmiany email
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setGlobalError("");

    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(newEmail),
      }));
    }
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
  };

  /**
   * Obsługa blur (oznaczenie pola jako dotknięte)
   */
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email),
      }));
    } else if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
      }));
    }
  };

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422 && data.details) {
          const fieldErrors: LoginFormErrors = {};
          if (data.details.email) fieldErrors.email = data.details.email[0];
          if (data.details.password) fieldErrors.password = data.details.password[0];
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Handle other errors (401, 400, 500)
        setGlobalError(data.error || "Wystąpił błąd podczas logowania");
        setIsLoading(false);
        return;
      }

      // Success - redirect to target URL
      window.location.href = redirectUrl;
    } catch {
      setGlobalError("Wystąpił nieoczekiwany błąd. Sprawdź połączenie z internetem i spróbuj ponownie.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Logowanie</CardTitle>
        <CardDescription>Zaloguj się do swojego konta Fitness Tracker</CardDescription>
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
              onBlur={() => handleBlur("email")}
              disabled={isLoading}
              className={`h-12 ${errors.email && touched.email ? "border-destructive" : ""}`}
              aria-invalid={errors.email && touched.email ? "true" : "false"}
              aria-describedby={errors.email && touched.email ? "email-error" : undefined}
              data-testid="login-email-input"
            />
            {errors.email && touched.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
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
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              disabled={isLoading}
              className={`h-12 ${errors.password && touched.password ? "border-destructive" : ""}`}
              aria-invalid={errors.password && touched.password ? "true" : "false"}
              aria-describedby={errors.password && touched.password ? "password-error" : undefined}
              data-testid="login-password-input"
            />
            {errors.password && touched.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {/* Przycisk submit */}
          <Button type="submit" className="w-full h-12" disabled={isLoading} data-testid="login-submit-button">
            {isLoading ? (
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
