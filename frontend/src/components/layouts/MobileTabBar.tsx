import { cn } from "../../lib/utils";
import type { AppNavItem } from "./AppSidebar";

interface MobileTabBarProps {
  navItems: AppNavItem[];
  activePath: string;
  onNavigate: (item: AppNavItem) => void;
}

export function MobileTabBar({
  navItems,
  activePath,
  onNavigate,
}: MobileTabBarProps) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 h-16 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-float backdrop-blur-xl">
      <div
        className="grid h-full px-1"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-9 items-center justify-center rounded-lg transition-colors",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileTabBar;
