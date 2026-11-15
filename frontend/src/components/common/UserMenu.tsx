import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface AppUser {
  name?: string | null;
  email?: string;
  role?: string | null;
  profileImage?: string;
}

interface UserMenuProps {
  user?: AppUser | null;
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
  profilePath?: string;
  className?: string;
}

function getInitials(user?: AppUser | null): string {
  const source = user?.name || user?.email || "U";
  return source.trim().slice(0, 2).toUpperCase();
}

export function UserMenu({
  user,
  onLogout,
  loggingOut = false,
  profilePath,
  className,
}: UserMenuProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full transition-transform hover:scale-105", className)}
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={user?.profileImage} alt={user?.name ?? "User"} />
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-semibold">{user?.name ?? "User"}</span>
          {user?.email && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profilePath && (
          <DropdownMenuItem onClick={() => navigate(profilePath)}>
            <UserIcon className="size-4" />
            Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          disabled={loggingOut}
          onClick={() => void onLogout()}
        >
          <LogOut className="size-4" />
          {loggingOut ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
