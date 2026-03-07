import { redis } from "../../config/cache.redis";
import ApirouteUsage from "./apiUsage.model";

export const incrementApiUsage = async (
  userId: string,
  apiKeyId: string,
  endpoint: string,
) => {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const hour = now.getHours();

  const baseKey = `apiUsage:${userId}:${apiKeyId}:${date}:${hour}`;

  await redis.incr(`${baseKey}:total`);
  await redis.incr(`${baseKey}:endpoint:${endpoint}`);

  await redis.expire(`${baseKey}:total`, 7200);
};

export const getApiUsage = async (userId: string) => {
  return ApirouteUsage.find({
    userId,
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
    },
  });
};
