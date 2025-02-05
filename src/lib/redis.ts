import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL not defined");
}

const options: Record<string, any> = {
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  tls: {
    // Force TLS 1.2 which is widely supported
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.2',
    rejectUnauthorized: false
  }
};

const redis = new Redis(redisUrl, options);

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redis;