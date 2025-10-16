// src/components/auth/RegisterForm.tsx
// Formularz rejestracji z walidacją

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { RegisterSchema } from "@/lib/schemas/auth";
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

interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  weight?: string;
  height?: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  weight: string;
  height: string;
}

/**
 * Formularz rejestracji
 * Integracja z Supabase Auth przez API endpoint /api/auth/register
 */
export function RegisterForm({ redirectUrl = "/dashboard" }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    weight: "",
    height: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Walidacja pola email
   */
  const validateEmail = (email: string): string | undefined => {
    const result = RegisterSchema.shape.email.safeParse(email);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja pola hasło
   */
  const validatePassword = (password: string): string | undefined => {
    const result = RegisterSchema.shape.password.safeParse(password);
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
   * Walidacja imienia
   */
  const validateName = (name: string): string | undefined => {
    const result = RegisterSchema.shape.name.safeParse(name);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja wagi
   */
  const validateWeight = (weight: string): string | undefined => {
    if (!weight) {
      return "Waga jest wymagana";
    }
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) {
      return "Waga musi być liczbą";
    }
    const result = RegisterSchema.shape.weight.safeParse(numWeight);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja wzrostu
   */
  const validateHeight = (height: string): string | undefined => {
    if (!height) {
      return "Wzrost jest wymagany";
    }
    const numHeight = parseFloat(height);
    if (isNaN(numHeight)) {
      return "Wzrost musi być liczbą";
    }
    const result = RegisterSchema.shape.height.safeParse(numHeight);
    return result.success ? undefined : result.error.errors[0].message;
  };

  /**
   * Walidacja całego formularza
   */
  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
      name: validateName(formData.name),
      weight: validateWeight(formData.weight),
      height: validateHeight(formData.height),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  /**
   * Obsługa zmiany pola
   */
  const handleFieldChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGlobalError("");

    if (touched[field]) {
      let error: string | undefined;
      switch (field) {
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          error = validatePassword(value);
          // Re-validate confirmPassword if it's already touched
          if (touched.confirmPassword) {
            setErrors((prev) => ({
              ...prev,
              confirmPassword: validateConfirmPassword(value, formData.confirmPassword),
            }));
          }
          break;
        case "confirmPassword":
          error = validateConfirmPassword(formData.password, value);
          break;
        case "name":
          error = validateName(value);
          break;
        case "weight":
          error = validateWeight(value);
          break;
        case "height":
          error = validateHeight(value);
          break;
      }
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  /**
   * Obsługa blur
   */
  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let error: string | undefined;
    switch (field) {
      case "email":
        error = validateEmail(formData.email);
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.password, formData.confirmPassword);
        break;
      case "name":
        error = validateName(formData.name);
        break;
      case "weight":
        error = validateWeight(formData.weight);
        break;
      case "height":
        error = validateHeight(formData.height);
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  /**
   * Obsługa submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    // Oznacz wszystkie pola jako dotknięte
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      name: true,
      weight: true,
      height: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors (422)
        if (response.status === 422 && data.details) {
          const fieldErrors: RegisterFormErrors = {};
          if (data.details.email) fieldErrors.email = data.details.email[0];
          if (data.details.password) fieldErrors.password = data.details.password[0];
          if (data.details.name) fieldErrors.name = data.details.name[0];
          if (data.details.weight) fieldErrors.weight = data.details.weight[0];
          if (data.details.height) fieldErrors.height = data.details.height[0];
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        // Handle other errors (400, 500)
        setGlobalError(data.error || "Wystąpił błąd podczas rejestracji");
        setIsLoading(false);
        return;
      }

      // Success - if email verification required, show message
      if (data.requiresEmailVerification) {
        setGlobalError("");
        // Show success message for 3 seconds before redirecting to login
        alert(data.message);
        window.location.href = "/auth/login";
      } else {
        // Auto-logged in - redirect to target URL
        window.location.href = redirectUrl;
      }
    } catch {
      setGlobalError("Wystąpił nieoczekiwany błąd. Sprawdź połączenie z internetem i spróbuj ponownie.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Rejestracja</CardTitle>
        <CardDescription>Stwórz nowe konto i zacznij śledzić swoje treningi</CardDescription>
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
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={isLoading}
              className={`h-12 ${errors.email && touched.email ? "border-destructive" : ""}`}
              aria-invalid={errors.email && touched.email ? "true" : "false"}
              aria-describedby={errors.email && touched.email ? "email-error" : undefined}
            />
            {errors.email && touched.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email}
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
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              disabled={isLoading}
              className={`h-12 ${errors.name && touched.name ? "border-destructive" : ""}`}
              aria-invalid={errors.name && touched.name ? "true" : "false"}
              aria-describedby={errors.name && touched.name ? "name-error" : undefined}
            />
            {errors.name && touched.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
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
                value={formData.weight}
                onChange={(e) => handleFieldChange("weight", e.target.value)}
                onBlur={() => handleBlur("weight")}
                disabled={isLoading}
                className={`h-12 ${errors.weight && touched.weight ? "border-destructive" : ""}`}
                aria-invalid={errors.weight && touched.weight ? "true" : "false"}
                aria-describedby={errors.weight && touched.weight ? "weight-error" : undefined}
              />
              {errors.weight && touched.weight && (
                <p id="weight-error" className="text-sm text-destructive">
                  {errors.weight}
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
                value={formData.height}
                onChange={(e) => handleFieldChange("height", e.target.value)}
                onBlur={() => handleBlur("height")}
                disabled={isLoading}
                className={`h-12 ${errors.height && touched.height ? "border-destructive" : ""}`}
                aria-invalid={errors.height && touched.height ? "true" : "false"}
                aria-describedby={errors.height && touched.height ? "height-error" : undefined}
              />
              {errors.height && touched.height && (
                <p id="height-error" className="text-sm text-destructive">
                  {errors.height}
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
              value={formData.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
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
              value={formData.confirmPassword}
              onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
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
