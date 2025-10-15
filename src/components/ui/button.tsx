import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary - niebieski przycisk (Dodaj, Dalej, Zapisz plan)
        default: "bg-primary text-white hover:bg-primary/90 disabled:opacity-50",

        // Secondary - jasnoniebieski przycisk (Wstecz, Anuluj)
        secondary:
          "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:border-primary/30 dark:hover:bg-primary/30",

        // Destructive - czerwony dla usuwania
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",

        // Outline - ramka
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",

        // Ghost - przezroczysty
        ghost: "hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20",

        // Dashed - przerywana ramka (dla "Dodaj serie hurtowo")
        dashed: "border border-dashed border-primary/40 bg-transparent text-primary hover:bg-primary/10",

        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
