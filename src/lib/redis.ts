import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

const client = createClient({ url: redisUrl });

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.connect();

export default client;