import { date } from "zod";
import Usage from "./overAllUsage.model";
import getCurrentMonthYear from "../../utils/getCurrentYearMonth";
import { getApiUsage } from "../apiUsage/apiUsage.service";
import normalizeHourlyData from "../../utils/normaliseHourlyAnalytics";
async function incrementLinkCreation(userId: string) {
  const { month, year } = getCurrentMonthYear();
  console.log(
    "Incrementing link creation for user:",
    userId,
    "Month:",
    month,
    "Year:",
    year,
  );
  await Usage.updateOne(
    { userId, month, year },
    { $inc: { linksCreated: 1 } },
    { upsert: true },
  );
}
async function getCurrentUsage(userId: string) {
  const { month, year } = getCurrentMonthYear();
  
  const [usage, apiUsage] = await Promise.all([
     Usage.findOne({ userId, month, year }),
    getApiUsage(userId), // your chart API logic
  ]);
  if (!usage) {
    return {
      usage: {
        month,
        year,
        linksCreated: 0,
        apiRequests: 0,
        
      },
      apiUsage: normalizeHourlyData(apiUsage),
    };
  }

  return { usage, apiUsage: normalizeHourlyData(apiUsage) };
}
export { incrementLinkCreation, getCurrentUsage };
