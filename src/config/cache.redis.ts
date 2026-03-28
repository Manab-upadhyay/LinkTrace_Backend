// cache.redis.ts
import dotenv from "dotenv";
dotenv.config();
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const useTls = redisUrl.startsWith("rediss://");

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  family: 4, // Force IPv4 to prevent ETIMEDOUT due to IPv6 DNS resolution issues
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 500, 10000),
});

import logger from "../utils/logger";

redis.on("connect", () => {
  logger.info("🟢 Redis Cache connected successfully");
});

redis.on("error", (err) => {
  logger.error("🔴 Redis Cache connection error:", err);
});
