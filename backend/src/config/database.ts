import "./env";
import mongoose from "mongoose";

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.floor(parsed)
    : fallback;
}

const CONNECT_ATTEMPTS = positiveInt(
  process.env.MONGO_CONNECT_ATTEMPTS,
  3
);
const CONNECT_RETRY_DELAY_MS = positiveInt(
  process.env.MONGO_CONNECT_RETRY_DELAY_MS,
  2000
);

interface MongoTargetSummary {
  scheme: string;
  hosts: string;
  database: string;
  replicaSet: string;
  authSource: string;
  tls: string;
  hasCredentials: boolean;
}

export function getMongoUri(): string {
  const uri = (process.env.MONGO_URI ?? "").trim();

  if (!uri) {
    throw new Error(
      "MONGO_URI is not set. Add it to backend/.env or the process environment."
    );
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      "MONGO_URI must start with mongodb:// or mongodb+srv://."
    );
  }

  return uri;
}

function describeMongoTarget(uri: string): MongoTargetSummary {
  const schemeMatch = uri.match(/^(mongodb(?:\+srv)?):\/\//i);
  const scheme = schemeMatch?.[1]?.toLowerCase() ?? "mongodb";

  const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//i, "");
  const credentialsEnd = withoutScheme.lastIndexOf("@");
  const hasCredentials = credentialsEnd >= 0;
  const hostAndDb =
    credentialsEnd >= 0
      ? withoutScheme.slice(credentialsEnd + 1)
      : withoutScheme;

  const queryStart = hostAndDb.indexOf("?");
  const beforeQuery =
    queryStart >= 0 ? hostAndDb.slice(0, queryStart) : hostAndDb;
  const query = queryStart >= 0 ? hostAndDb.slice(queryStart + 1) : "";

  const dbStart = beforeQuery.indexOf("/");
  const hosts = dbStart >= 0 ? beforeQuery.slice(0, dbStart) : beforeQuery;
  const database = dbStart >= 0 ? beforeQuery.slice(dbStart + 1) : "";

  const params = new URLSearchParams(query);

  return {
    scheme,
    hosts,
    database,
    replicaSet: params.get("replicaSet") ?? "default",
    authSource: params.get("authSource") ?? "default",
    tls:
      params.get("tls") ??
      params.get("ssl") ??
      (scheme === "mongodb+srv" ? "enabled by srv" : "default"),
    hasCredentials,
  };
}

function redactMongoUri(value: string): string {
  return value
    .replace(
      /(mongodb(?:\+srv)?:\/\/)[^@\s]+@/gi,
      "$1***:***@"
    )
    .replace(/password=[^&\s]*/gi, "password=***");
}

function errorDetails(error: unknown): {
  name: string;
  message: string;
  code: string;
  reason?: string;
  cause?: string;
} {
  const record =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : null;

  const name =
    error instanceof Error ? error.name : typeof error === "string" ? "Error" : "UnknownError";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  const codeValue = record?.code;
  const code =
    typeof codeValue === "string" || typeof codeValue === "number"
      ? String(codeValue)
      : "";

  const reasonValue = record?.reason;
  const reason =
    reasonValue instanceof Error
      ? `${reasonValue.name}: ${reasonValue.message}`
      : typeof reasonValue === "string"
        ? reasonValue
        : undefined;

  const causeValue = record?.cause;
  const cause =
    causeValue instanceof Error
      ? `${causeValue.name}: ${causeValue.message}${(causeValue as NodeJS.ErrnoException).code ? ` (${(causeValue as NodeJS.ErrnoException).code})` : ""}`
      : undefined;

  return {
    name,
    message: redactMongoUri(message),
    code,
    reason: reason ? redactMongoUri(reason) : undefined,
    cause,
  };
}

function connectionHint(details: ReturnType<typeof errorDetails>): string {
  const text = `${details.name} ${details.message} ${details.reason ?? ""} ${details.code}`.toLowerCase();

  if (
    text.includes("authentication failed") ||
    text.includes("bad auth") ||
    text.includes("scram") ||
    text.includes("invalid credentials") ||
    text.includes("auth error")
  ) {
    return "Atlas rejected the database credentials. Verify the MongoDB user/password in MONGO_URI and that authSource=admin is correct. Percent-encode special characters in the password.";
  }

  if (
    text.includes("enotfound") ||
    text.includes("eai_again") ||
    text.includes("dns") ||
    text.includes("querysrv")
  ) {
    return "The Atlas hostname could not be resolved. Check DNS/network connectivity and that the cluster hostnames in MONGO_URI are current.";
  }

  if (text.includes("econnrefused") || text.includes("connection refused")) {
    return "The Atlas host refused the connection. Confirm outbound TCP 27017 is allowed and the cluster is running.";
  }

  if (
    text.includes("server selection") ||
    text.includes("etimedout") ||
    text.includes("connection timed out") ||
    text.includes("timeout")
  ) {
    return "Atlas did not accept the connection before the timeout. Add this machine's public IP to Atlas Network Access (or 0.0.0.0/0 for local development), confirm the cluster is not paused, and allow outbound TCP 27017.";
  }

  if (text.includes("not authorized") || text.includes("unauthorized")) {
    return "The Atlas user is authenticated but lacks permission on this database. Check the user's Atlas roles and the database name in MONGO_URI.";
  }

  return "Check MONGO_URI, Atlas Network Access/IP allowlist, cluster status, and outbound network access to port 27017.";
}

function logConnectionFailure(
  error: unknown,
  attempt: number,
  target: MongoTargetSummary
): void {
  const details = errorDetails(error);

  console.error(
    `[mongo] Connection attempt ${attempt}/${CONNECT_ATTEMPTS} failed`
  );
  console.error(
    `[mongo] Target: ${target.scheme}://${target.hosts}/${target.database} ` +
      `(replicaSet=${target.replicaSet}, authSource=${target.authSource}, tls=${target.tls}, credentials=${target.hasCredentials ? "present" : "missing"})`
  );
  console.error(`[mongo] ${details.name}: ${details.message}`);

  if (details.code) console.error(`[mongo] code: ${details.code}`);
  if (details.reason) console.error(`[mongo] reason: ${details.reason}`);
  if (details.cause) console.error(`[mongo] cause: ${details.cause}`);

  console.error(`[mongo] Hint: ${connectionHint(details)}`);
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function connectToDatabase(
  uri: string = getMongoUri()
): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const target = describeMongoTarget(uri);

  mongoose.connection.on("connected", () => {
    console.log("[mongo] Connection established");
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[mongo] Connection lost");
  });

  mongoose.connection.on("error", (error) => {
    const details = errorDetails(error);
    console.error(
      `[mongo] Connection error: ${details.name}: ${details.message}`
    );
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: Number(
          process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS
        ) || 15000,
        connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 15000,
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
      });

      await mongoose.connection.db?.admin().command({ ping: 1 });
      console.log(
        `[mongo] Connected to ${target.hosts}/${target.database}`
      );
      return mongoose;
    } catch (error) {
      lastError = error;
      logConnectionFailure(error, attempt, target);

      if (attempt < CONNECT_ATTEMPTS) {
        await wait(CONNECT_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("MongoDB connection failed");
}

export async function disconnectFromDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
