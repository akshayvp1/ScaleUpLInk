import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-card text-muted-foreground shadow-soft">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
