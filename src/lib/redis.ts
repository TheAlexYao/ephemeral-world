import { createClient } from "redis";

let client: ReturnType<typeof createClient>;

export function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined");
    }

    client = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method',
      }
    });

    client.on("error", (err) => console.error("Redis Client Error:", err));
    client.connect().catch(console.error);
  }
  return client;
}

export default getRedisClient();