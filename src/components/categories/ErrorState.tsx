// ErrorState.tsx - Error state component with retry button

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string; // opcjonalny custom error message
  onRetry: () => void; // callback do retry
  errorType?: "network" | "server" | "auth"; // typ błędu dla różnych komunikatów
}

export default function ErrorState({ message, onRetry, errorType }: ErrorStateProps) {
  // Generowanie komunikatu na podstawie typu błędu
  const getErrorMessage = () => {
    if (message) return message;

    switch (errorType) {
      case "network":
        return "Brak połączenia z serwerem. Sprawdź połączenie internetowe.";
      case "server":
        return "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.";
      case "auth":
        return "Sesja wygasła. Zaloguj się ponownie.";
      default:
        return "Nie udało się załadować kategorii. Sprawdź połączenie internetowe i spróbuj ponownie.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Wystąpił błąd</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{getErrorMessage()}</p>
      <Button onClick={onRetry} variant="default">
        <RefreshCw className="h-4 w-4 mr-2" />
        Spróbuj ponownie
      </Button>
    </div>
  );
}
