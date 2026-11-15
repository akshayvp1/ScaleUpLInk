import React, { useEffect } from "react";
import { Bell, X } from "lucide-react";

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
}

interface NotificationToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
  onClick?: (id: string) => void;
}

const AUTO_DISMISS_MS = 6000;

const NotificationToast: React.FC<
  NotificationToastProps
> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  useEffect(() => {
    const timer = setTimeout(
      () => {
        onDismiss(notification.id);
      },
      AUTO_DISMISS_MS
    );

    return () => clearTimeout(timer);
  }, [
    notification.id,
    onDismiss,
  ]);

  return (
    <div
      role="alert"
      onClick={() =>
        onClick?.(notification.id)
      }
      className="flex w-80 max-w-[90vw] cursor-pointer animate-in items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-float duration-300 slide-in-from-right"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
        <Bell className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0 flex-grow">
        <p className="truncate text-sm font-semibold text-foreground">
          {notification.title}
        </p>

        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.body}
        </p>

        <p className="mt-1 text-[11px] font-medium text-primary">
          Click to view notifications
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();

          onDismiss(
            notification.id
          );
        }}
        className="flex-shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default NotificationToast;