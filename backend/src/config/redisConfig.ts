import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config(); 

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

// Handle Redis Connection
redisClient.connect().catch((err) => {
  console.error("❌ Redis Connection Failed:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected Successfully!");
});

export default redisClient;
