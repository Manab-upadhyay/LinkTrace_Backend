import {
  getUserAnalytics,
  getLinkAnalytics,
  getTopLinks,
  getClicksGroupedByHour,
  getLinkAnalyticsPerHour,
  getWeeklyTrend,
  getWeeklyTrendPerLink,
  getPerLinkDashboard,
} from "./analytics.service";
import { asyncHandler } from "../../utils/asynchandler";
import { ApiError } from "../../utils/ApiError";

export const getUserAnalyticsController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user._id;
    const analytics = await getUserAnalytics(userId);
    res.status(200).json(analytics);
  },
);
export const getLinkAnalyticsController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user._id;
    const { linkId } = req.params;
    if (!linkId) {
      throw new ApiError(400, "Link ID is required");
    }
    const analytics = await getLinkAnalytics(linkId, userId);
    res.status(200).json(analytics);
  },
);
export const getTopLinksController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user._id;
    const { limit } = req.query;
    if (limit && isNaN(parseInt(limit))) {
      throw new ApiError(400, "Limit must be a number");
    }
    const topLinks = await getTopLinks(userId, parseInt(limit) || 5);
    res.status(200).json(topLinks);
  },
);
export const getHourlyClicksController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user.id;

    const data = await getClicksGroupedByHour(userId);

    res.status(200).json({
      success: true,
      data,
    });
  },
);
export const getLinkAnalyticsPerHourController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user.id;
    const { linkId } = req.params;
    if (!linkId) {
      throw new ApiError(400, "Link ID is required");
    }
    const data = await getLinkAnalyticsPerHour(linkId, userId);
    res.status(200).json({
      success: true,
      data,
    });
  },
);
export const getWeeklyTrendController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user._id;
    const analytics = await getWeeklyTrend(userId);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  },
);
export const getWeeklyTrendPerLinkController = asyncHandler(
  async (req: any, res: any) => {
    const { linkId } = req.params;
    if (!linkId) {
      throw new ApiError(400, "Link ID is required");
    }
    const analytics = await getWeeklyTrendPerLink(linkId);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  },
);
export const getPerLinkDashboardController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.user._id;
    const { linkId } = req.params;
    if (!linkId) {
      throw new ApiError(400, "Link ID is required");
    }
    const data = await getPerLinkDashboard(linkId, userId);
    res.status(200).json(data);
  },
);
export default {
  getUserAnalyticsController,
  getLinkAnalyticsController,
  getTopLinksController,
  getHourlyClicksController,
  getLinkAnalyticsPerHourController,
  getWeeklyTrendController,
  getWeeklyTrendPerLinkController,
  getPerLinkDashboardController,
};
