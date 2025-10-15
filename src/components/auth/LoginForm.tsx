// src/components/auth/LoginForm.tsx
// Login form component with Supabase authentication

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

import type { Database } from "@/db/database.types";
import { LoginSchema } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  supabaseUrl: string;
  supabaseKey: string;
}

export function LoginForm({ supabaseUrl, supabaseKey }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate form data
      const validationResult = LoginSchema.safeParse({ email, password });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setError(firstError.message);
        setIsLoading(false);
        return;
      }

      // Create Supabase browser client with cookie support
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // Attempt login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (loginError) {
        setError(
          loginError.message === "Invalid login credentials" ? "Nieprawidłowy email lub hasło" : loginError.message
        );
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        setError("Nie udało się utworzyć sesji");
        setIsLoading(false);
        return;
      }

      // Successful login - redirect to dashboard
      window.location.href = "/dashboard";
    } catch {
      setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>Zaloguj się do swojego konta Fitness Tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <a href="/auth/register" className="text-primary hover:underline">
              Nie masz konta? Zarejestruj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
