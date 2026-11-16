import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL?.trim();
const redisHost = process.env.REDIS_HOST?.trim();
const redisPort = Number(process.env.REDIS_PORT);
const redisPassword = process.env.REDIS_PASSWORD;
const redisUsername = process.env.REDIS_USERNAME;

if (
  !redisUrl &&
  (!redisHost ||
    !process.env.REDIS_PORT ||
    !Number.isInteger(redisPort) ||
    redisPort < 1 ||
    redisPort > 65535)
) {
  throw new Error(
    `Invalid Redis configuration. Set REDIS_URL or REDIS_HOST/REDIS_PORT. REDIS_HOST: ${
      redisHost || "Missing"
    }, REDIS_PORT: ${process.env.REDIS_PORT || "Missing"}`
  );
}

const redisClient = createClient({
  ...(redisUrl
    ? { url: redisUrl }
    : {
        socket: {
          host: redisHost,
          port: redisPort,
        },
        ...(redisUsername ? { username: redisUsername } : {}),
        ...(redisPassword ? { password: redisPassword } : {}),
      }),
  socket: {
    ...(redisUrl ? {} : { host: redisHost, port: redisPort }),
    reconnectStrategy: (retries) => {
      console.log("Redis reconnecting...");
      return Math.min(retries * 1000, 5000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

export default redisClient;
