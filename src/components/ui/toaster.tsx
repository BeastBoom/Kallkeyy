"use client";

import { useToast } from "@/hooks/use-toast";
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport,
  ToastIcon,
  ToastProgress
} from "@/components/ui/toast";

const TOAST_DURATION = 1500; // 1.5 seconds

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <ToastIcon variant={variant} />
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
            <ToastProgress duration={TOAST_DURATION} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
