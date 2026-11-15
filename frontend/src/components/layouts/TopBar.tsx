import { useState, type FormEvent, type ReactNode } from "react";
import { Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { Input } from "../ui/input";

interface TopBarProps {
  showSearch?: boolean;
  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;
  right?: ReactNode;
  className?: string;
}

export function TopBar({
  showSearch = false,
  onSearchSubmit,
  searchPlaceholder = "Search...",
  right,
  className,
}: TopBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearchSubmit?.(query.trim());
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:px-6",
        className
      )}
    >
      {showSearch && (
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-full border-border/70 bg-muted/50 pl-10 pr-4 focus-visible:bg-card"
            aria-label="Search"
          />
        </form>
      )}

      <div className="ml-auto flex items-center gap-2">{right}</div>
    </header>
  );
}

export default TopBar;
