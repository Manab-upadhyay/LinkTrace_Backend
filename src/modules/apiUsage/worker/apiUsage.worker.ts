import ApiRouteUsage from "../apiUsage.model";
import { redis } from "../../../config/cache.redis";
import cron from "node-cron";
import overAllUsageModel from "../../overallUsage/overAllUsage.model";
import getCurrentYearMonth from "../../../utils/getCurrentYearMonth";
export const startApiUsageWorker = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running API usage flush job...");
    await flushApiUsage();
  });
};
export const flushApiUsage = async () => {
  const stream = redis.scanStream({
    match: "apiUsage:*:total",
    count: 100,
  });

  for await (const keys of stream) {
    for (const key of keys) {
      const parts = key.split(":");

      const userId = parts[1];
      const apiKeyId = parts[2];
      const date = parts[3];
      const hour = parseInt(parts[4]);

      const totalRequests = await redis.get(key);
     
      if (!totalRequests) continue;

      const count = Number(totalRequests);

      await ApiRouteUsage.updateOne(
        { userId, apiKeyId, date, hour },
        { $inc: { totalRequests: count } },
        { upsert: true },
      );

      const { month, year } = getCurrentYearMonth();

      await overAllUsageModel.updateOne(
        { userId, month, year },
        { $inc: { apiRequests: count } },
        { upsert: true },
      );

      await redis.del(key);
    }
  }

  console.log("Flush completed");
};
