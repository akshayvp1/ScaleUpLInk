import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchService, SearchResult } from "../../services/search/searchService";

interface SearchComponentProps {
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  onSelect?: (result: SearchResult) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  placeholder = "Search",
  debounceMs = 350,
  minChars = 2,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const requestIdRef = useRef<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (term: string) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchService.search({ name: term });
      if (currentRequestId === requestIdRef.current) {
        setResults(data);
      }
    } catch {
      if (currentRequestId === requestIdRef.current) {
        setError("Something went wrong. Please try again.");
        setResults([]);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < minChars) {
      requestIdRef.current += 1;
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(trimmed), debounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, minChars, debounceMs, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  // Clicking a result takes the user to that person's profile. If the
  // parent passed onSelect, we still call it (e.g. for pickers that
  // don't want navigation), but navigation is the default behavior.
  const handleSelect = (result: SearchResult) => {
    setQuery("");
    setResults([]);
    setIsFocused(false);
    if (onSelect) {
      onSelect(result);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  // Tracks results whose image failed to load, so we can fall back to
  // an initials avatar instead of a broken image icon.
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

  const trimmedLength = query.trim().length;
  const showDropdown = isFocused && trimmedLength >= minChars;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-2 rounded-xl border bg-muted px-3.5 py-2.5 transition-colors ${
          isFocused ? "border-primary bg-card" : "border-transparent"
        }`}
      >
        <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query.length > 0 && (
          <button
            type="button"
            onClick={clearQuery}
            aria-label="Clear search"
            className="flex-shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-float">
          {error ? (
            <p className="px-3 py-6 text-center text-sm text-destructive">{error}</p>
          ) : isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Searching…
            </p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                {result.profileImage && !brokenImages[result.id] ? (
                  <img
                    src={result.profileImage}
                    alt={result.name}
                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-1 ring-border"
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [result.id]: true }))
                    }
                  />
                ) : (
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {getInitials(result.name)}
                  </span>
                )}
                <span className="truncate">{result.name}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;