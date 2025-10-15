// src/components/auth/LogoutButton.tsx
// Logout button component with Supabase sign out

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

import type { Database } from "@/db/database.types";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  supabaseUrl: string;
  supabaseKey: string;
  userName?: string;
}

export function LogoutButton({ supabaseUrl, supabaseKey, userName }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
      await supabase.auth.signOut();

      // Redirect to home page after logout
      window.location.href = "/";
    } catch {
      // If logout fails, still redirect (clear client state)
      window.location.href = "/";
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {userName && <span className="text-sm text-muted-foreground hidden md:inline">Witaj, {userName}</span>}
      <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
        {isLoading ? "Wylogowywanie..." : "Wyloguj"}
      </Button>
    </div>
  );
}
