import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-brand-purple to-brand-purple-dark hover:from-brand-purple-dark hover:to-brand-purple text-background font-semibold shadow-lg hover:shadow-brand-purple/30 hover:shadow-xl transform hover:-translate-y-0.5",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-600/30",
        outline: "border border-border-subtle bg-transparent text-text-primary hover:bg-surface-hover hover:border-brand-purple",
        secondary: "bg-surface text-text-primary hover:bg-surface-elevated border border-border-subtle",
        ghost: "text-text-primary hover:bg-surface-hover hover:text-text-primary",
        link: "text-brand-purple underline-offset-4 hover:underline hover:text-brand-purple-light",
        brand: "bg-gradient-to-r from-brand-purple to-brand-cyan hover:from-brand-cyan hover:to-brand-purple text-background font-bold tracking-wide shadow-xl hover:shadow-neon transform hover:-translate-y-1 hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
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
