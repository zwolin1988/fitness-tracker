// src/components/layout/AppScrollArea.tsx
// Wrapper component for shadcn ScrollArea to use in Astro layouts

import { ScrollArea } from "@/components/ui/scroll-area";

interface AppScrollAreaProps {
  children: React.ReactNode;
}

/**
 * Application-wide scroll area wrapper
 * Uses shadcn/ui ScrollArea for consistent scrolling behavior
 * Height is set to full viewport minus navbar height (64px)
 */
export function AppScrollArea({ children }: AppScrollAreaProps) {
  return (
    <ScrollArea className="w-full" style={{ height: "calc(100vh - 64px)" }}>
      <div className="min-h-full">{children}</div>
    </ScrollArea>
  );
}
