import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, MapPin, Search, Send, UserRound, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import chatService from "../../services/chat/chatService";
import eventService from "../../services/event/eventService";
import type { UserList } from "../../types/chat/types";
import { useAppSelector } from "../../redux/hooks";

export interface ShareEventSummary {
  id: string;
  title: string;
  image?: string;
  startDate?: string | Date;
  startTime?: string;
  venue?: string;
  city?: string;
}

interface ShareEventModalProps {
  event: ShareEventSummary;
  onClose: () => void;
}

export default function ShareEventModal({
  event,
  onClose,
}: ShareEventModalProps) {
  const currentUserId = useAppSelector(
    (state) => state.auth.user?._id ?? state.auth.user?.id ?? null
  );

  const [users, setUsers] = useState<UserList[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      const result = await chatService.getUsers();

      if (!active) return;

      if (result.success && result.data) {
        setUsers(result.data.filter((user) => user._id !== currentUserId));
      } else {
        setError(result.message || "Could not load your connections.");
      }

      setIsLoading(false);
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [currentUserId]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }, [query, users]);

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selectedIds.length === 0 || isSending) return;

    setIsSending(true);
    try {
      const { sharedCount } = await eventService.shareEventToUsers(
        event.id,
        selectedIds
      );
      toast.success(
        sharedCount === 1
          ? "Event shared in 1 conversation."
          : `Event shared in ${sharedCount} conversations.`
      );
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to share event"
      );
    } finally {
      setIsSending(false);
    }
  };

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const dateLabel =
    startDate && !Number.isNaN(startDate.getTime())
      ? format(startDate, "EEE, MMM d, yyyy")
      : "";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Share this event
              </p>
              <p className="text-xs text-muted-foreground">
                Send a bookable event card in chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-3">
            {event.image ? (
              <img
                src={event.image}
                alt=""
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Calendar className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-foreground">
                {event.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {dateLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateLabel}
                    {event.startTime ? ` · ${event.startTime}` : ""}
                  </span>
                )}
                {(event.venue || event.city) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[event.venue, event.city].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 pt-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search connections..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserRound className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No connections found
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Connect with people to share events with them.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredUsers.map((user) => {
                const checked = selectedIds.includes(user._id);

                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => toggleUser(user._id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                      checked
                        ? "border-primary/50 bg-primary/5"
                        : "border-transparent hover:bg-muted/60"
                    }`}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {user.name || "Member"}
                      </span>
                      {user.profession && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.profession}
                        </span>
                      )}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={selectedIds.length === 0 || isSending}
            >
              {isSending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
