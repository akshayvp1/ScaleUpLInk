import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Ready");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis Reconnecting...");
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