import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-[72px] sm:top-[80px] left-3 right-5 sm:left-auto sm:right-4 z-[100] flex max-h-screen w-full flex-col gap-2 sm:max-w-[380px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-10 shadow-xl backdrop-blur-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-toast-slide-in data-[state=closed]:animate-toast-slide-out",
  {
    variants: {
      variant: {
        default: "bg-white/95 border-gray-200/50 text-[#0a0a0a]",
        destructive: "bg-white/95 border-red-200/50 text-[#0a0a0a]",
        success: "bg-white/95 border-green-200/50 text-[#0a0a0a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ToastIconProps {
  variant?: "default" | "destructive" | "success" | null;
}

const ToastIcon: React.FC<ToastIconProps> = ({ variant }) => {
  if (variant === "destructive") {
    return <AlertCircle className="h-5 w-5 text-[#b90e0a] flex-shrink-0 mt-0.5" />;
  }
  if (variant === "success") {
    return <CheckCircle2 className="h-5 w-5 text-[#b90e0a] flex-shrink-0 mt-0.5" />;
  }
  return <Info className="h-5 w-5 text-[#b90e0a] flex-shrink-0 mt-0.5" />;
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white/50 px-3 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#b90e0a] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-lg p-1 text-gray-400 opacity-70 transition-all hover:opacity-100 hover:bg-gray-100 hover:text-[#b90e0a] focus:outline-none focus:ring-2 focus:ring-[#b90e0a]",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn("text-sm font-bold text-[#0a0a0a]", className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm text-gray-600", className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// Progress bar component for toast
interface ToastProgressProps {
  duration: number;
}

const ToastProgress: React.FC<ToastProgressProps> = ({ duration }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden rounded-b-xl">
      <div 
        className="h-full bg-[#b90e0a] origin-left animate-toast-progress"
        style={{
          animationDuration: `${duration}ms`,
        }}
      />
    </div>
  );
};

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ToastProgress,
};
