// AdminFAB.tsx - Floating Action Button for admins

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminFABProps {
  userRole?: string | null; // rola użytkownika (z Zustand store lub context)
}

export default function AdminFAB({ userRole }: AdminFABProps) {
  // Render tylko dla adminów
  if (userRole !== "admin") {
    return null;
  }

  const handleClick = () => {
    window.location.href = "/admin/categories";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              style={{ backgroundColor: "var(--orange, hsl(25 95% 53%))" }}
              onClick={handleClick}
              aria-label="Zarządzaj kategoriami"
            >
              <Plus className="h-6 w-6" />
              <span className="sr-only">Zarządzaj kategoriami</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Zarządzaj kategoriami</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
