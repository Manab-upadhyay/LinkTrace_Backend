// cache.redis.ts
import dotenv from "dotenv";
dotenv.config();
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const useTls = redisUrl.startsWith("rediss://");

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(useTls ? { tls: {} } : {}),
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 500, 10000),
});
