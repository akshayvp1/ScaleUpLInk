import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

interface AuthHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  className?: string;
}

export function AuthHeader({
  icon,
  title,
  description,
  badge,
  className,
}: AuthHeaderProps) {
  return (
    <div className={cn("space-y-3 text-center", className)}>
      {icon && (
        <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-xl">
          {icon}
        </div>
      )}
      {badge}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default AuthHeader;
