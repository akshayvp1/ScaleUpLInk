import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-32-characters";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.STRIPE_SECRET_KEY = "sk_test_phase1_harness";
process.env.REDIS_HOST = "127.0.0.1";
process.env.REDIS_PORT = "6379";

if (!process.env.MONGOMS_SYSTEM_BINARY && process.platform === "win32") {
  const base = "C:\\Program Files\\MongoDB\\Server";

  if (existsSync(base)) {
    const versions = readdirSync(base).sort().reverse();

    for (const version of versions) {
      const candidate = join(base, version, "bin", "mongod.exe");

      if (existsSync(candidate)) {
        process.env.MONGOMS_SYSTEM_BINARY = candidate;
        break;
      }
    }
  }
}
