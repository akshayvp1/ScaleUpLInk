import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

interface TopBarProps {
  right?: ReactNode;
  className?: string;
}

export function TopBar({ right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:px-6",
        className
      )}
    >
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </header>
  );
}

export default TopBar;
