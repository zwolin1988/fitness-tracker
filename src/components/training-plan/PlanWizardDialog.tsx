// src/components/training-plan/PlanWizardDialog.tsx
// Dialog wrapper dla PlanWizard

import { X } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { PlanWizard } from "./PlanWizard";
import type { PlanWizardDialogProps } from "./types";

/**
 * Dialog wrapper dla wizarda tworzenia planu
 */
export function PlanWizardDialog({ open, onOpenChange, onSuccess }: PlanWizardDialogProps) {
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    // Reset wizarda poprzez zmianę key
    setKey((prev) => prev + 1);
    // Wywołaj callback sukcesu (odświeżenie listy)
    onSuccess();
    // Zamknij dialog
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Zamknij dialog
    onOpenChange(false);
    // Reset wizarda
    setKey((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Zamknij</span>
        </button>

        {/* PlanWizard bez ScrollArea - zarządza swoim scrollem wewnętrznie */}
        <PlanWizard key={key} mode="create" onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
