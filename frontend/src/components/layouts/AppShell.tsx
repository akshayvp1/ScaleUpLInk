import { useState, type ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

import { cn } from "../../lib/utils";
import { useIsMobile } from "../../hooks/use-mobile";
import { AppSidebar, type AppNavItem } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileTabBar } from "./MobileTabBar";
import { Logo } from "../common/Logo";
import { UserMenu, type AppUser } from "../common/UserMenu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

function getInitials(user?: AppUser | null): string {
  const source = user?.name || user?.email || "U";
  return source.trim().slice(0, 2).toUpperCase();
}

interface AppShellProps {
  brandShort?: string;
  brandTitle: string;
  navItems: AppNavItem[];
  user?: AppUser | null;
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
  profilePath?: string;
  topBarRight?: ReactNode;
  children?: ReactNode;
}

export function AppShell({
  brandShort = "SUL",
  brandTitle,
  navItems,
  user,
  onLogout,
  loggingOut = false,
  profilePath,
  topBarRight,
  children,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (item: AppNavItem) => {
    setIsMenuOpen(false);
    if (item.onClick) {
      item.onClick();
      return;
    }
    navigate(item.path);
  };

  const mobileNavItems = navItems.filter((item) => item.mobileVisible);
  const isChatRoute =
    location.pathname === "/chat" || location.pathname.startsWith("/chat/");
  const isHomeRoute =
    location.pathname === "/home" || location.pathname === "/feeds";

  if (isChatRoute) {
    return (
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <Outlet />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {!isMobile && (
        <AppSidebar
          brandShort={brandShort}
          brandTitle={brandTitle}
          navItems={navItems}
          activePath={location.pathname}
          onNavigate={handleNavigate}
          isCompact={isCompact}
          onToggleCompact={() => setIsCompact((value) => !value)}
          user={user}
          onLogout={onLogout}
          loggingOut={loggingOut}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <header className="z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-background/90 px-3 backdrop-blur-xl sm:px-4">
            <div className="flex min-w-0 items-center gap-1">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85%] max-w-xs gap-0 p-0"
                >
                  <SheetHeader className="border-b border-border/70 p-5">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <Logo short={brandShort} title={brandTitle} />
                  </SheetHeader>
                  <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleNavigate(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="truncate text-sm font-medium">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                  <div className="border-t border-border/70 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user?.profileImage}
                          alt={user?.name ?? "User"}
                        />
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {user?.name ?? "User"}
                        </p>
                        <p className="truncate text-xs capitalize text-muted-foreground">
                          {user?.role ?? ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMenuOpen(false);
                        void onLogout();
                      }}
                      disabled={loggingOut}
                      className="w-full justify-start rounded-xl"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <Logo short={brandShort} title={brandTitle} className="min-w-0" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {topBarRight}
              <UserMenu
                user={user}
                onLogout={onLogout}
                loggingOut={loggingOut}
                profilePath={profilePath}
              />
            </div>
          </header>
        ) : (
          <TopBar right={topBarRight} />
        )}

        <main
          className={cn(
            "surface-gradient flex-grow overflow-y-auto",
            isMobile ? "pb-24" : ""
          )}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
              isHomeRoute && "py-4 sm:py-5"
            )}
          >
            <Outlet />
            {children}
          </div>
        </main>
      </div>

      {isMobile && (
        <MobileTabBar
          navItems={mobileNavItems}
          activePath={location.pathname}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default AppShell;
