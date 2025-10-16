// src/components/auth/LogoutButton.tsx
// Logout button component using API endpoint

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Logout button component
 * Calls /api/auth/logout and redirects to home page
 */
export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to home page after successful logout
        window.location.href = "/";
      } else {
        // If logout fails, still redirect but show error
        console.error("Logout failed");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if request fails, redirect to home
      window.location.href = "/";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="hidden sm:flex items-center gap-2 text-foreground hover:bg-muted"
    >
      <LogOut className="size-4" />
      {isLoading ? "Wylogowywanie..." : "Wyloguj"}
    </Button>
  );
}
