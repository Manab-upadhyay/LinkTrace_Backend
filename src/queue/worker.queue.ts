import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import { redis } from "../config/redis.config";
import { redis as pubClient } from "../config/cache.redis";
import countModel from "../modules/count/count.model";
import Link from "../modules/link/link.model";
import ConnectToDatabase from "../config/db.config";
import logger from "../utils/logger";

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "📍";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

const worker = new Worker(
  "analyticsQueue",
  async (job) => {
    ConnectToDatabase();
    const { linkId, ip, userAgent } = job.data;
console.log("bull mq started ")
    let userLocation = {
      regionName: "Unknown",
      countryName: "Unknown",
      countryCode: "",
      city: "Unknown",
    };

    try {
      const getLocation = await fetch(
       `https://ipinfo.io/${ip}/json`
      );
      logger.info("getLocation", getLocation)
      const data = await getLocation.json();
      console.log("data", data)
      userLocation = {
        regionName: data.region|| "Unknown",
        countryName: data.country|| "Unknown",
        countryCode: data.postal || "Unknown",
        city: data.city || "Unknown",
      };
    } catch (err) {
      logger.error("Geo lookup failed:", err);
    }
console.log("userLocation", userLocation)
    await Link.updateOne({ _id: linkId }, { $inc: { clicks: 1 } });
    await countModel.create({
      linkId,
      ip,
      userAgent,
      location: userLocation,
    });

    // ── Live Tracking ──────────────────────────────────────────────────────────
    const liveEvent = {
      country: userLocation.countryName,
      countryCode: userLocation.countryCode,
      flag: getFlagEmoji(userLocation.countryCode),
      city: userLocation.city,
      timestamp: new Date().toISOString(),
    };
console.log("live event", liveEvent)
    const eventJson = JSON.stringify(liveEvent);

    // 1. Publish to Redis Pub/Sub for realtime dashboard updates
   const pub = await pubClient.publish(`live:clicks:${linkId}`, eventJson);
console.log("pub", pub)
    // 2. Push to Redis List for initial load history (keep last 20)
    const historyKey = `live:history:${linkId}`;
    await pubClient.lpush(historyKey, eventJson);
    await pubClient.ltrim(historyKey, 0, 19);
    await pubClient.expire(historyKey, 60 * 60 * 24); // 24h expiration
  },
  {
    connection: redis,
  },
);
worker.on("ready", () => {
  logger.info("Analytics worker started and ready");
});
worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed`, err);
});
