import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL not defined");
}

const options: Record<string, any> = {};

if (redisUrl.startsWith("rediss://")) {
  const redisParsedUrl = new URL(redisUrl);
  Object.assign(options, {
    tls: {
      rejectUnauthorized: false,
      servername: redisParsedUrl.hostname,
    },
  });
}

const redis = new Redis(redisUrl, options);
export default redis;