import dotenv from "dotenv";
dotenv.config();

// BullMQ bundles its own ioredis, so we pass raw connection options.
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const parsed = new URL(redisUrl);
const useTls = parsed.protocol === "rediss:";

export const redis = {
  host: parsed.hostname,
  port: Number(parsed.port) || 6379,
  ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
  ...(parsed.username && parsed.username !== "default" ? { username: parsed.username } : {}),
  ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  family: 4, // Force IPv4 to prevent ETIMEDOUT due to IPv6 DNS resolution issues
  maxRetriesPerRequest: null as null, // required by BullMQ
  enableReadyCheck: false,
  retryStrategy: (times: number) => Math.min(times * 500, 5000),
};
