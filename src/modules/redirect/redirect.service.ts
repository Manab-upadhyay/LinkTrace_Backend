import Link from "../link/link.model";
import { analyticsQueue } from "../../queue/analytics.queue";
import { redis } from "../../config/cache.redis";
import { LRUCache } from "lru-cache";

// L1: In-memory LRU cache — near-zero latency
const memCache = new LRUCache<string, { url: string; linkId: string }>({
  max: 10_000,         // max 10k short codes in memory
  ttl: 1000 * 60 * 5,  // 5 minute TTL
});

async function redirect(
  shortCode: string,
  ip: string,
  userAgent?: string,
  userId?: string,
): Promise<{ url: string; cacheSource: "memory" | "redis" | "db" }> {

  // ── L1: In-memory cache (< 1ms) ──
  const memHit = memCache.get(shortCode);
  if (memHit) {
    analyticsQueue
      .add("trackClick", {
        linkId: memHit.linkId,
        userId: userId ?? null,
        shortCode,
        ip,
        userAgent,
      })
      .catch(() => {});

    return { url: memHit.url, cacheSource: "memory" };
  }

  // ── L2: Redis cache ──
  const cachedUrl = await redis.get(`short:${shortCode}`);
  if (cachedUrl) {
    const parsed = JSON.parse(cachedUrl);

    // Promote to L1
    memCache.set(shortCode, parsed);

    analyticsQueue
      .add("trackClick", {
        linkId: parsed.linkId,
        userId: userId ?? null,
        shortCode,
        ip,
        userAgent,
      })
      .catch(() => {});

    return { url: parsed.url, cacheSource: "redis" };
  }

  // ── L3: MongoDB ──
  const link = await Link.findOne({ shortCode, isActive: true });

  if (!link) {
    throw new Error("Link not found");
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    throw new Error("Link has expired");
  }

  const cacheEntry = { url: link.url, linkId: link._id.toString() };

  // Populate L1 + L2
  memCache.set(shortCode, cacheEntry);
  await redis.set(
    `short:${shortCode}`,
    JSON.stringify(cacheEntry),
    "EX",
    60 * 60 * 24,
  );

  analyticsQueue
    .add("analyticsQueue", {
      linkId: link._id,
      userId: userId ?? null,
      shortCode,
      ip,
      userAgent,
    })
    .catch(() => {});

  return { url: link.url, cacheSource: "db" };
}

export { redirect };
