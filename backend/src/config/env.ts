import path from "node:path";
import dotenv from "dotenv";

// Resolve the backend `.env` from this file instead of relying on the current
// working directory. This keeps `npm run dev` (src) and `npm start` (dist)
// working even when the process is launched from the repository root.
const backendEnvPath = path.resolve(__dirname, "../../.env");

const backendResult = dotenv.config({ path: backendEnvPath });

// Fall back to the conventional cwd lookup for deployments/tests that provide
// their own .env. dotenv never overrides values that are already set.
if (backendResult.error) {
  dotenv.config();
}

if (
  backendResult.error &&
  (backendResult.error as NodeJS.ErrnoException).code !== "ENOENT"
) {
  console.warn(
    `[env] Could not load ${backendEnvPath}: ${backendResult.error.message}`
  );
}
