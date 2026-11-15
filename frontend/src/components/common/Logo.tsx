import { cn } from "../../lib/utils";

interface LogoProps {
  short?: string;
  title: string;
  compact?: boolean;
  onDark?: boolean;
  className?: string;
}

export function Logo({
  short = "SUL",
  title,
  compact = false,
  onDark = false,
  className,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3 overflow-hidden", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold tracking-tight text-primary-foreground shadow-sm ring-1 ring-inset ring-white/15">
        {short}
      </div>
      {!compact && (
        <span
          className={cn(
            "truncate text-lg font-bold tracking-tight transition-all duration-300 [font-family:var(--font-display)]",
            onDark ? "text-sidebar-foreground" : "text-foreground"
          )}
        >
          {title}
        </span>
      )}
    </div>
  );
}

export default Logo;
