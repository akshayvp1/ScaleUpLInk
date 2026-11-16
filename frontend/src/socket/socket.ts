import { io } from "socket.io-client";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const isLocalHostname = (hostname: string): boolean =>
  LOCAL_HOSTNAMES.has(hostname);

const parseUrl = (value: string | undefined): URL | null => {
  if (!value) return null;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : undefined;
    return new URL(value, base);
  } catch {
    return null;
  }
};

const resolveSocketUrl = (): string => {
  const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
  const explicitUrl = parseUrl(explicit);
  const pageIsLocal =
    typeof window === "undefined" || isLocalHostname(window.location.hostname);

  if (explicit && explicitUrl) {
    const explicitIsLocal = isLocalHostname(explicitUrl.hostname);

    if (!explicitIsLocal || pageIsLocal) {
      const useHttps =
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        explicitUrl.protocol === "http:" &&
        !explicitIsLocal;

      return trimTrailingSlash(
        useHttps
          ? `https://${explicitUrl.host}`
          : explicitUrl.origin,
      );
    }
  }

  const apiCandidates = [
    import.meta.env.VITE_API_SHARED,
    import.meta.env.VITE_API_CHAT,
    import.meta.env.VITE_API_GROUP,
    import.meta.env.VITE_API_ENTREPRENEUR,
  ] as (string | undefined)[];

  for (const candidate of apiCandidates) {
    const parsed = parseUrl(candidate);

    if (parsed) {
      return trimTrailingSlash(parsed.origin);
    }
  }

  if (typeof window !== "undefined" && !pageIsLocal) {
    return trimTrailingSlash(window.location.origin);
  }

  return "http://localhost:5000";
};

export const SOCKET_URL = resolveSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  tryAllTransports: true,
});
