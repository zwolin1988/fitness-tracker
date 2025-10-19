// src/components/auth/AuthSuccessMessage.tsx
// Reusable success message component for authentication flows

import { CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthSuccessMessageProps {
  /**
   * Title displayed in the card header
   */
  title: string;

  /**
   * Description displayed below the title
   */
  description: string;

  /**
   * Main success message content
   */
  message: string;

  /**
   * Primary button text
   */
  primaryButtonText: string;

  /**
   * Primary button click handler
   */
  onPrimaryClick: () => void;

  /**
   * Optional secondary button text
   */
  secondaryButtonText?: string;

  /**
   * Optional secondary button click handler
   */
  onSecondaryClick?: () => void;

  /**
   * Optional additional content to display below the alert
   */
  children?: React.ReactNode;
}

/**
 * Success message component for authentication flows
 * Used for registration confirmation, password reset success, etc.
 */
export function AuthSuccessMessage({
  title,
  description,
  message,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  children,
}: AuthSuccessMessageProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {children}

        <div className="flex flex-col gap-3">
          <Button type="button" variant="default" className="w-full h-12" onClick={onPrimaryClick}>
            {primaryButtonText}
          </Button>

          {secondaryButtonText && onSecondaryClick && (
            <Button type="button" variant="outline" className="w-full h-12" onClick={onSecondaryClick}>
              {secondaryButtonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
