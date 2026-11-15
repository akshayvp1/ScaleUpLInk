import type { ElementType } from "react";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Logo } from "../common/Logo";
import type { AppUser } from "../common/UserMenu";

export interface AppNavItem {
  icon: ElementType;
  label: string;
  path: string;
  mobileVisible?: boolean;
  onClick?: () => void;
}

interface AppSidebarProps {
  brandShort?: string;
  brandTitle: string;
  navItems: AppNavItem[];
  activePath: string;
  onNavigate: (item: AppNavItem) => void;
  isCompact: boolean;
  onToggleCompact: () => void;
  user?: AppUser | null;
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
}

function getInitials(user?: AppUser | null): string {
  const source = user?.name || user?.email || "U";
  return source.trim().slice(0, 2).toUpperCase();
}

export function AppSidebar({
  brandShort = "SUL",
  brandTitle,
  navItems,
  activePath,
  onNavigate,
  isCompact,
  onToggleCompact,
  user,
  onLogout,
  loggingOut = false,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "z-20 flex flex-col border-r border-sidebar-border/80 bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300 ease-in-out",
        isCompact ? "w-20" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border/80 px-5 py-5">
        <Logo
          short={brandShort}
          title={brandTitle}
          compact={isCompact}
          onDark
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCompact}
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCompact ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-grow space-y-1.5 overflow-y-auto px-3 py-6">
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item)}
              className={cn(
                "group relative flex w-full items-center rounded-xl px-3 py-3 text-left transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCompact && "justify-center"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isCompact ? "mx-auto" : "mr-3.5"
                )}
              />
              {!isCompact && (
                <span className="whitespace-nowrap text-sm font-medium">
                  {item.label}
                </span>
              )}
              {isActive && !isCompact && (
                <span className=                  "ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/90" />
              )}
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "mx-3 mb-4 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/50 p-3 backdrop-blur-sm",
          isCompact && "px-2"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCompact ? "justify-center" : "justify-start"
          )}
        >
          <Avatar
            className={cn(
              "h-10 w-10 border border-sidebar-border",
              !isCompact && "mr-3"
            )}
          >
            <AvatarImage src={user?.profileImage} alt={user?.name ?? "User"} />
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          {!isCompact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs capitalize text-sidebar-foreground/60">
                {user?.role ?? ""}
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size={isCompact ? "icon" : "default"}
          onClick={() => void onLogout()}
          disabled={loggingOut}
          className={cn(
            "mt-3 w-full rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCompact ? "h-10" : "justify-start"
          )}
        >
          <LogOut className={cn("h-5 w-5", !isCompact && "mr-3")} />
          {!isCompact && (
            <span className="text-sm font-medium">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}

export default AppSidebar;
