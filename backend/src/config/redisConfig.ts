
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST;
const redisPort = Number(process.env.REDIS_PORT);

if (!redisHost || !process.env.REDIS_PORT || !Number.isInteger(redisPort) || redisPort < 1 || redisPort > 65535) {
  throw new Error(
    `Invalid Redis configuration. REDIS_HOST: ${redisHost || "Missing"}, REDIS_PORT: ${process.env.REDIS_PORT || "Missing"}`
  );
}

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: redisPort,
    reconnectStrategy: (retries) => {
      console.log("🔄 Redis Reconnecting...");
      return Math.min(retries * 1000, 5000);
    },
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Ready");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis Connection Failed:", err);
  }
})();

export default redisClient;
