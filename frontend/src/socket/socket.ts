import { io } from "socket.io-client";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const isLocalHostname = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(hostname);

const parseUrl = (value: string | undefined): URL | null => {
  if (!value) return null;

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : undefined;
    return new URL(value, base);
  } catch {
    return null;
  }
};

const resolveSocketUrl = (): string => {
  const pageIsLocal =
    typeof window === "undefined" || isLocalHostname(window.location.hostname);

  // 1. Explicit socket URL (set VITE_SOCKET_URL in Render and REBUILD).
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const explicitUrl = parseUrl(explicit);

  if (explicit && explicitUrl) {
    const explicitIsLocal = isLocalHostname(explicitUrl.hostname);

    // Ignore a localhost URL when the page is deployed.
    if (!explicitIsLocal || pageIsLocal) {
      const upgradeToHttps =
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        explicitUrl.protocol === "http:" &&
        !explicitIsLocal;

      return trimTrailingSlash(
        upgradeToHttps ? `https://${explicitUrl.host}` : explicitUrl.origin,
      );
    }
  }

  // 2. Fall back to the origin of one of the REST API URLs.
  //    Only absolute URLs are accepted, because a relative URL such as
  //    "/api/chat" would resolve to the FRONTEND origin (no Socket.IO there).
  const apiCandidates = [
    import.meta.env.VITE_API_SHARED,
    import.meta.env.VITE_API_CHAT,
    import.meta.env.VITE_API_GROUP,
    import.meta.env.VITE_API_ENTREPRENEUR,
  ] as (string | undefined)[];

  for (const candidate of apiCandidates) {
    if (!candidate || !/^https?:\/\//i.test(candidate)) continue;

    const parsed = parseUrl(candidate);
    if (parsed) {
      return trimTrailingSlash(parsed.origin);
    }
  }

  // 3. Local development default (must match the backend PORT).
  if (pageIsLocal) {
    return "http://localhost:4040";
  }

  // 4. Deployed but nothing configured: this is almost certainly a mistake.
  console.error(
    "[socket] VITE_SOCKET_URL is not set. Set it to your backend URL " +
      "(e.g. https://scaleuplink-7.onrender.com) and rebuild the frontend.",
  );
  return trimTrailingSlash(window.location.origin);
};

export const SOCKET_URL = resolveSocketUrl();

// Always holds the latest token so automatic reconnects use a fresh one.
let currentToken: string | null = null;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  // Function form: evaluated on every (re)connect attempt.
  auth: (cb) => {
    cb({ token: currentToken ?? "" });
  },
});

console.log("[socket] URL:", SOCKET_URL);

// ─── Diagnostics ──────────────────────────────────────────────────────
socket.on("connect", () => {
  console.log("✅ [socket] connected:", socket.id, "via", socket.io.engine.transport.name);
});

socket.on("connect_error", (error) => {
  console.error("❌ [socket] connect_error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ [socket] disconnected:", reason);

  // The server kicked us (missing/invalid token or inactive account).
  // Socket.IO does NOT auto-reconnect in this case, so do it manually
  // only if we still have a token.
  if (reason === "io server disconnect" && currentToken) {
    console.warn("[socket] server closed the connection – check the token.");
  }
});

socket.io.on("reconnect_attempt", (attempt) => {
  console.log("🔄 [socket] reconnect attempt:", attempt);
});

socket.io.on("reconnect_failed", () => {
  console.error("❌ [socket] reconnect failed");
});

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Call after login and on page refresh once the access token is available.
 * Safe to call multiple times.
 */
export const connectSocket = (token: string | null | undefined): void => {
  if (!token || token === "undefined" || token === "null") {
    console.warn("[socket] connectSocket called without a valid token");
    return;
  }

  const tokenChanged = currentToken !== token;
  currentToken = token;

  if (socket.connected && !tokenChanged) return;

  // Token changed (e.g. refreshed / different user): reconnect with the new one.
  if (socket.connected && tokenChanged) {
    socket.disconnect();
  }

  socket.connect();
};

/** Call on logout. */
export const disconnectSocket = (): void => {
  currentToken = null;
  socket.disconnect();
};