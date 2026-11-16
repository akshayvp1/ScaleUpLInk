// src/components/seats/SeatMap.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Seat } from "../../services/seat/seatServics";

interface SeatMapProps {
  seats: Seat[];
  rows: string[]; // display order, e.g. ["A","B","C","D","E","F"]
  aisleAfter?: number; // seat number after which to render a visual gap
  maxSelectable?: number;
  holdMinutes?: number;
  currentUserId?: string | null;
  onContinue: (selected: Seat[]) => void;
  onRefreshSeats?: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_LABEL_CLASS: Record<string, string> = {
  VIP: "text-warning",
  Premium: "text-primary",
  General: "text-muted-foreground",
};

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  isMine: boolean;
  onToggle: (seat: Seat) => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, isSelected, isMine, onToggle }) => {
  const base =
    "relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-t-md text-[10px] font-semibold transition-all duration-150 select-none";

  if (seat.status === "booked") {
    return (
      <div
        title={`${seat.seatLabel} · Sold`}
        className={`${base} bg-muted text-muted-foreground cursor-not-allowed`}
        aria-disabled="true"
      >
        <svg viewBox="0 0 12 12" className="w-3 h-3">
          <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  // Held by someone else -> disabled. Held by me (isMine) -> treat as selected/clickable.
  if (seat.status === "held" && !isMine) {
    return (
      <div
        title={`${seat.seatLabel} · Being selected by another user`}
        className={`${base} bg-muted text-muted-foreground/60 border border-dashed border-input cursor-not-allowed`}
        aria-disabled="true"
      >
        {seat.number}
      </div>
    );
  }

  return (
    <button
      type="button"
      title={`${seat.seatLabel} · ${seat.category} · ₹${seat.price}`}
      onClick={() => onToggle(seat)}
      aria-pressed={isSelected}
      className={`${base} border ${
        isSelected
          ? "bg-primary border-primary text-white shadow-sm scale-105"
          : "bg-card border-input text-muted-foreground hover:border-primary/40 hover:text-primary"
      }`}
    >
      {isSelected ? (
        <svg viewBox="0 0 12 12" className="w-3.5 h-3.5">
          <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        seat.number
      )}
    </button>
  );
};

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  rows,
  aisleAfter = 6,
  maxSelectable = 8,
  holdMinutes = 5,
  currentUserId = null,
  onContinue,
  onRefreshSeats,
  isSubmitting = false,
}) => {
  const [selected, setSelected] = useState<Record<string, Seat>>({});
  const [now, setNow] = useState(() => Date.now());
  const initializedEventRef = useRef<string | null>(null);
  const expiredEventRef = useRef<string | null>(null);

  const seatsByRow = useMemo(() => {
    const map: Record<string, Seat[]> = {};
    rows.forEach((row) => {
      map[row] = seats
        .filter((s) => s.row === row)
        .sort((a, b) => a.number - b.number);
    });
    return map;
  }, [seats, rows]);

  const categoryByRow = useMemo(() => {
    const map: Record<string, string> = {};
    rows.forEach((row) => {
      const rowSeats = seatsByRow[row];
      if (rowSeats && rowSeats.length > 0) map[row] = rowSeats[0].category;
    });
    return map;
  }, [rows, seatsByRow]);

  const eventKey = seats[0]?.eventId ?? null;

  const myHeldSeats = useMemo(
    () =>
      seats.filter(
        (seat) =>
          seat.status === "held" &&
          !!currentUserId &&
          seat.heldBy === currentUserId
      ),
    [seats, currentUserId]
  );

  const nextHoldExpiry = useMemo(() => {
    const timestamps = myHeldSeats
      .map((seat) => (seat.holdExpiresAt ? new Date(seat.holdExpiresAt).getTime() : NaN))
      .filter((value) => Number.isFinite(value));

    return timestamps.length > 0 ? Math.min(...timestamps) : null;
  }, [myHeldSeats]);

  // Pull seats this user already holds back into the selection so returning
  // from checkout doesn't make them look available again.
  useEffect(() => {
    if (myHeldSeats.length === 0) {
      if (seats.length > 0) initializedEventRef.current = eventKey;
      return;
    }

    if (initializedEventRef.current === eventKey) return;

    setSelected((prev) => {
      const next = { ...prev };
      myHeldSeats.forEach((seat) => {
        next[seat.seatLabel] = seat;
      });
      return next;
    });

    initializedEventRef.current = eventKey;
  }, [eventKey, myHeldSeats, seats.length]);

  useEffect(() => {
    if (nextHoldExpiry === null) return;

    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [nextHoldExpiry]);

  useEffect(() => {
    if (nextHoldExpiry === null || nextHoldExpiry > now) return;
    if (expiredEventRef.current === eventKey) return;

    expiredEventRef.current = eventKey;
    setSelected((prev) => {
      const next = { ...prev };
      Object.entries(next).forEach(([label, seat]) => {
        const expiry = seat.holdExpiresAt
          ? new Date(seat.holdExpiresAt).getTime()
          : NaN;
        if (Number.isFinite(expiry) && expiry <= now) {
          delete next[label];
        }
      });
      return next;
    });
    onRefreshSeats?.();
  }, [eventKey, nextHoldExpiry, now, onRefreshSeats]);

  const holdSecondsLeft =
    nextHoldExpiry === null
      ? null
      : Math.max(0, Math.ceil((nextHoldExpiry - now) / 1000));

  const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleSeat = (seat: Seat) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[seat.seatLabel]) {
        delete next[seat.seatLabel];
      } else {
        if (Object.keys(next).length >= maxSelectable) return prev;
        next[seat.seatLabel] = seat;
      }
      return next;
    });
  };

  const selectedList = Object.values(selected).sort((a, b) =>
    a.seatLabel.localeCompare(b.seatLabel)
  );
  const total = selectedList.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="h-1 w-full bg-primary" />

      <div className="p-5 md:p-8">
        {/* Stage */}
        <div className="flex flex-col items-center mb-8">
          <div
              className="w-2/3 h-2.5 rounded-t-full bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"
            style={{ clipPath: "ellipse(50% 100% at 50% 100%)" }}
          />
          <span className="text-[11px] tracking-[0.3em] text-muted-foreground font-medium mt-2 uppercase">
            Stage this way
          </span>
        </div>

        {/* Seat grid */}
        <div className="flex flex-col items-center gap-2 overflow-x-auto pb-2">
          {rows.map((row) => {
            const rowSeats = seatsByRow[row] || [];
            const category = categoryByRow[row];
            return (
              <div key={row} className="flex items-center gap-3">
                <span className="w-4 text-xs font-semibold text-muted-foreground">{row}</span>
                <div className="flex items-center gap-1.5">
                  {rowSeats.map((seat) => {
                    const isMine =
                      seat.status === "held" && !!currentUserId && seat.heldBy === currentUserId;
                    return (
                      <React.Fragment key={seat.seatLabel}>
                        <SeatButton
                          seat={seat}
                          isSelected={!!selected[seat.seatLabel] || isMine}
                          isMine={isMine}
                          onToggle={toggleSeat}
                        />
                        {seat.number === aisleAfter && <div className="w-4" />}
                      </React.Fragment>
                    );
                  })}
                </div>
                {category && (
                  <span
                    className={`w-16 text-[10px] font-medium ${
                      CATEGORY_LABEL_CLASS[category] || "text-muted-foreground"
                    }`}
                  >
                    {category}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm bg-card border border-input" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm bg-primary" />
            Selected
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm bg-muted border border-dashed border-input" />
            In progress by others
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-t-sm bg-muted" />
            Sold
          </div>
        </div>
      </div>

      {/* Selection summary / footer */}
      <div className="flex flex-col gap-4 border-t border-border bg-muted/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {selectedList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tap seats above to select — up to {maxSelectable} at a time.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedList.map((s) => (
                <span
                  key={s.seatLabel}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {s.seatLabel}
                  <button
                    type="button"
                    onClick={() => toggleSeat(s)}
                    className="text-primary hover:text-primary"
                    aria-label={`Remove seat ${s.seatLabel}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {selectedList.length > 0 && holdSecondsLeft === null && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Seats are held for {holdMinutes} minutes once you continue to payment.
            </p>
          )}
          {holdSecondsLeft !== null && (
            <p
              className={`mt-2 text-[11px] font-medium ${
                holdSecondsLeft <= 60 ? "text-destructive" : "text-muted-foreground"
              }`}
              role="status"
              aria-live="polite"
            >
              {holdSecondsLeft > 0
                ? `Your seats are held for ${formatCountdown(holdSecondsLeft)}. Complete payment before the timer ends.`
                : "Your seat hold has expired. Please select seats again."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-primary">₹{total.toFixed(2)}</div>
          </div>
          <button
            type="button"
            disabled={selectedList.length === 0 || isSubmitting}
            onClick={() => onContinue(selectedList)}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
              selectedList.length > 0 && !isSubmitting
                ? "bg-primary hover:bg-primary/90"
                : "bg-muted cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Holding seats…" : "Continue to payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;