const DEFAULT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

const normalizeOrigin = (origin: string): string =>
  origin.trim().replace(/\/+$/, "");

const parseOrigins = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

const configuredOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGINS),
];

export const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    ...(process.env.NODE_ENV === "production" ? [] : DEFAULT_ORIGINS),
  ]),
);

export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);

  return allowedOrigins.some((allowed) => {
    if (allowed === "*") return true;

    if (allowed.startsWith("*.")) {
      try {
        const hostname = new URL(normalized).hostname;
        const suffix = allowed.slice(1);
        return hostname === allowed.slice(2) || hostname.endsWith(suffix);
      } catch {
        return false;
      }
    }

    return allowed === normalized;
  });
};

export const corsOrigin = (
  origin: string | undefined,
  callback: (error: Error | null, allow?: boolean) => void,
): void => {
  callback(null, isOriginAllowed(origin));
};

export const corsOptions = {
  origin: corsOrigin,
  credentials: true,
};
