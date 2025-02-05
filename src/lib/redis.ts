import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL not defined");
}

const url = new URL(redisUrl);
const options: Record<string, any> = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  username: url.username,
  password: url.password,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

if (url.protocol === 'rediss:') {
  options.tls = {
    servername: url.hostname
  };
}

const redis = new Redis(options);

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redis;