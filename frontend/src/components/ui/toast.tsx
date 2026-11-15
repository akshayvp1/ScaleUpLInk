// src/components/ui/toast.tsx
import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  durationMs?: number;
}

export const SuccessToast: React.FC<ToastProps> = ({
  message,
  show,
  onClose,
  durationMs = 4000,
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (!show) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // let exit animation finish before unmount
    }, durationMs);
    return () => clearTimeout(timer);
  }, [show, durationMs, onClose]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-success/25 bg-card px-4 py-3 text-card-foreground shadow-float transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-full bg-success/10 p-1.5">
        <CheckCircle2 className="h-5 w-5 text-success" />
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};