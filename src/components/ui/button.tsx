import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-body",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        // Editorial variants
        editorial: "bg-foreground text-background tracking-widest uppercase hover:bg-foreground/90",
        "editorial-outline": "border border-foreground text-foreground tracking-widest uppercase hover:bg-foreground hover:text-background bg-transparent",
        minimal: "bg-transparent text-foreground hover:text-muted-foreground px-0 underline-offset-4 hover:underline",
        hero: "bg-foreground text-background font-body text-sm tracking-[0.15em] uppercase hover:bg-foreground/90",
        "hero-outline": "bg-transparent border border-foreground text-foreground font-body text-sm tracking-[0.15em] uppercase hover:bg-foreground hover:text-background",
        "glass-gold": "bg-foreground text-background hover:bg-foreground/90",
        glass: "bg-secondary text-foreground border border-border hover:bg-secondary/80",
        gold: "bg-foreground text-background hover:bg-foreground/90",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        xl: "h-14 px-10 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
