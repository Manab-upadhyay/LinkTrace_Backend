import { redis } from "../../config/cache.redis";

export interface LiveClickEvent {
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  timestamp: string;
}

/**
 * Returns up to 20 most-recent live click events for a link.
 * The list is pre-populated by the analytics worker via LPUSH.
 */
export async function getRecentClicks(linkId: string): Promise<LiveClickEvent[]> {
  const raw = await redis.lrange(`live:history:${linkId}`, 0, 19);
  console.log("raw", raw)
  return raw.map((item) => {
    try {
      return JSON.parse(item) as LiveClickEvent;
    } catch {
      return null;
    }
  }).filter(Boolean) as LiveClickEvent[];
}
