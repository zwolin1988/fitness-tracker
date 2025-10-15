import { useState, useCallback, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
  className?: string;
}

export function LoginForm({ onSubmit, className }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    return password.length >= 8;
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      // Early validation returns
      if (!email.trim()) {
        setError("Adres email jest wymagany");
        return;
      }

      if (!validateEmail(email)) {
        setError("Nieprawidłowy format adresu email");
        return;
      }

      if (!password) {
        setError("Hasło jest wymagane");
        return;
      }

      if (!validatePassword(password)) {
        setError("Hasło musi mieć co najmniej 8 znaków");
        return;
      }

      setIsLoading(true);

      try {
        if (onSubmit) {
          await onSubmit(email, password);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onSubmit, validateEmail, validatePassword]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>Wprowadź swój email i hasło, aby się zalogować</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={error !== null}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={error !== null}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="polite"
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
