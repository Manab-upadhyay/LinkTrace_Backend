import Link from "../link/link.model";
import mongoose from "mongoose";
import countModel from "../count/count.model";
import normalizeHourlyData from "../../utils/normaliseHourlyAnalytics";

async function getLinkAnalyticsPerHour(linkId: string, userId: string) {
  const link = await Link.findOne({ _id: linkId, userId });

  if (!link) {
    throw new Error("Link not found or unauthorized");
  }

  const analytics = await countModel.aggregate([
    {
      $match: {
        linkId: new mongoose.Types.ObjectId(linkId),
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
        },
      },
    },
    
    {
      $group: {
        _id: {
          hour: {
            $hour: {
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
        },
        total: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.hour": 1 },
    },
  ]);

  return normalizeHourlyData(analytics);
}
async function getLinkAnalytics(linkId: string, userId: string) {
  const link = await Link.findOne({ _id: linkId, userId, isActive: true });
  if (!link) {
    throw new Error("Link not found or unauthorized");
  }
  const LinkDetails = await countModel.find({ linkId });
  return {
    LinkDetails,
    createdAt: link.createdAt,
  };
}

async function getUserAnalytics(userId: string) {
  const analytics = await Link.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalLinks: { $sum: 1 },
        totalClicks: { $sum: "$clicks" },
      },
    },
  ]);
  const linkIds = await Link.find({ userId }, { _id: 1 });
  
  const linkIdsArray = linkIds.map((link) => link._id);
  
  const todaysClicks = await countModel.countDocuments({
    linkId: { $in: linkIdsArray },
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
    },
   
  });

  const result= {
    totalLinks: analytics[0]?.totalLinks || 0,
    totalClicks: analytics[0]?.totalClicks || 0,
    todaysClicks: todaysClicks||0
  }
  return result;
}
async function getClicksGroupedByHour(
  userId: string,

) {
  // Step 1: Get all user's links
  const links = await Link.find(
    { userId: new mongoose.Types.ObjectId(userId) },
    { _id: 1 },
  );

  const linkIds = links.map((link) => link._id);

  if (linkIds.length === 0) {
    return [];
  }

  // Step 2: Build match stage
  const matchStage: any = {
    linkId: { $in: linkIds },
  };
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
  
    matchStage.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
  

  // Step 3: Aggregate clicks
  const analytics = await countModel.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          hour: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
        },

        totalClicks: { $sum: 1 },
      },
    },
    { $sort: { "_id.hour": 1 } },
  ]);
  return normalizeHourlyData(analytics);
}
async function getTopLinks(userId: string, limit: number = 5) {
  const topLinks = await Link.find({ userId })
    .sort({ clicks: -1 })
    .limit(limit)
    .select("name url shortCode clicks createdAt");

  return topLinks;
}
async function getWeeklyTrend(userId: string) {
  const now = new Date();

  const last7Start = new Date(now);
  last7Start.setDate(now.getDate() - 7);

  const prev7Start = new Date(now);
  prev7Start.setDate(now.getDate() - 14);

  const userLinks = await Link.find({ userId }, { _id: 1 });

  const linkIds = userLinks.map((link) => link._id);

  if (linkIds.length === 0) {
    return {
      last7DaysClicks: 0,
      previous7DaysClicks: 0,
      percentage: 0,
      isPositive: true,
    };
  }

  const last7DaysClicks = await countModel.countDocuments({
    linkId: { $in: linkIds },
    createdAt: {
      $gte: last7Start,
      $lt: now,
    },
  });

  const previous7DaysClicks = await countModel.countDocuments({
    linkId: { $in: linkIds },
    createdAt: {
      $gte: prev7Start,
      $lt: last7Start,
    },
  });

  let percentage = 0;

  if (previous7DaysClicks === 0) {
    percentage = last7DaysClicks > 0 ? 100 : 0;
  } else {
    percentage =
      ((last7DaysClicks - previous7DaysClicks) / previous7DaysClicks) * 100;
  }

  return {
    last7DaysClicks,
    previous7DaysClicks,
    percentage: Math.round(percentage),
    isPositive: percentage >= 0,
  };
}
async function getWeeklyTrendPerLink(LinkId: string) {
  const now = new Date();

  const last7Start = new Date(now);
  last7Start.setDate(now.getDate() - 7);

  const prev7Start = new Date(now);
  prev7Start.setDate(now.getDate() - 14);

  // 🔥 Last 7 Days
  const last7DaysClicks = await countModel.countDocuments({
    linkId: LinkId,
    createdAt: {
      $gte: last7Start,
      $lt: now,
    },
  });

  // 🔥 Previous 7 Days
  const previous7DaysClicks = await countModel.countDocuments({
    linkId: LinkId,
    createdAt: {
      $gte: prev7Start,
      $lt: last7Start,
    },
  });

  // 🔥 Calculate Percentage
  let percentage = 0;

  if (previous7DaysClicks === 0) {
    percentage = last7DaysClicks > 0 ? 100 : 0;
  } else {
    percentage =
      ((last7DaysClicks - previous7DaysClicks) / previous7DaysClicks) * 100;
  }

  return {
    last7DaysClicks,
    previous7DaysClicks,
    percentage: Math.round(percentage),
    isPositive: percentage >= 0,
  };
}
async function getPerLinkDashboard(linkId: string, userId: string) {
  //calls all analytics for a specific link to show in dashboard
  const [summary, hourly, weeklyTrend] = await Promise.all([
    getLinkAnalytics(linkId, userId),
    getLinkAnalyticsPerHour(linkId, userId),
    getWeeklyTrendPerLink(linkId),
  ]);

  return {
    summary,
    hourly,
    weeklyTrend,
  };
}

export {
  getLinkAnalytics,
  getUserAnalytics,
  getTopLinks,
  getClicksGroupedByHour,
  getLinkAnalyticsPerHour,
  getWeeklyTrend,
  getWeeklyTrendPerLink,
  getPerLinkDashboard,
};
