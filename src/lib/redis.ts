import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL not defined");
}

const url = new URL(redisUrl);

// For Redis Cloud, we need to use the full URL with SSL options
const redis = new Redis(redisUrl, {
  tls: {
    // Redis Cloud uses a self-signed certificate
    rejectUnauthorized: false,
    // Explicitly set TLS version
    minVersion: 'TLSv1.2',
  },
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableAutoPipelining: true,
  enableReadyCheck: false,
  lazyConnect: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
  if (error.code === 'ECONNREFUSED') {
    console.error('Could not connect to Redis. Please check if Redis server is running.');
  } else if (error.code === 'ERR_SSL_WRONG_VERSION_NUMBER') {
    console.error('SSL/TLS version mismatch. Please check Redis server SSL configuration.');
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('ready', () => {
  console.log('Redis client is ready to accept commands');
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

// Test the connection
redis.ping().then(() => {
  console.log('Redis connection test successful');
}).catch((error) => {
  console.error('Redis connection test failed:', error);
});

export default redis;