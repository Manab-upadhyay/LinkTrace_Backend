import ratelimitter from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/cache.redis";

/**
 * Key Generator: Prioritizes userId if authenticated, falls back to IP.
 * This ensures that multiple users on the same WiFi (same IP) don't 
 * share the same rate limit bucket once they are logged in.
 */
const keyGenerator = (req: any) => {
  return req.userId || req.ip;
};

export const authRateLimiter = ratelimitter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator,
  store: new RedisStore({
    // @ts-expect-error - rate-limit-redis type mismatch with ioredis call
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  message: {
    success: false,
    message: "Too many requests from this IP/User, please try again after 15 minutes",
  },
});

export const apiRateLimiter = ratelimitter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300,
  keyGenerator,
  store: new RedisStore({
    // @ts-expect-error - rate-limit-redis type mismatch with ioredis call
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  message: {
    success: false,
    message: "Too many requests from this IP/User, please try again after an hour",
  },
});

