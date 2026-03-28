import { Request, Response, NextFunction } from "express";
import Link from "../link/link.model";
import { getRecentClicks } from "./liveTracking.service";
import { ApiError } from "../../utils/ApiError";

/**
 * GET /api/live/:linkId/recent
 * Returns the last 20 live click events for a link owned by the logged-in user.
 */
export async function getRecentClicksController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log("params",req.params)
    const linkId = req.params.linkId as string;
    const userId = (req as any).userId as string;
console.log("userid",userId)
    // Ownership check — linkId must belong to THIS user
    const link = await Link.findOne({ _id: linkId, userId });
    if (!link) {
      throw new ApiError(403, "Link not found or access denied");
    }

    const clicks = await getRecentClicks(linkId);
    res.status(200).json({ success: true, data: clicks });
  } catch (error) {
    next(error);
  }
}
