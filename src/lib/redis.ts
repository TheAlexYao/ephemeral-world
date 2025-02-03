import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

const client = createClient({
  url: redisUrl,
  socket: {
    tls: process.env.NODE_ENV === "production",
    rejectUnauthorized: false, // Required for Redis Cloud
    reconnectStrategy: (retries) => {
      // Exponential backoff
      return Math.min(retries * 100, 3000);
    },
  },
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("Redis Client Connected");
});

client.on("reconnecting", () => {
  console.log("Redis Client Reconnecting");
});

// Connect with retry logic
async function connectWithRetry(maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.connect();
      return;
    } catch (err) {
      console.error(`Failed to connect to Redis (attempt ${i + 1}/${maxRetries}):`, err);
      if (i === maxRetries - 1) throw err;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)));
    }
  }
}

// Initialize connection
connectWithRetry().catch((err) => {
  console.error("Failed to connect to Redis after all retries:", err);
  process.exit(1);
});

export default client;