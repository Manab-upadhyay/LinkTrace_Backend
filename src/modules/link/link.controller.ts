import {
  addLink,
  getLink,
  getUserLinks,
  updateLink,
  deleteLink,
  getTopLinks
} from "./link.service";
import { asyncHandler } from "../../utils/asynchandler";
import { ApiError } from "../../utils/ApiError";
import { incrementLinkCreation } from "../overallUsage/overAllUsage.service";
export const addLinkController = asyncHandler(async (req: any, res: any) => {
  const { url, name, expiresAt, customAlias } = req.body;
  if (!url || !name) {
    throw new ApiError(400, "URL and name are required");
  }
  const userId = req.userId;
  const newLink = await addLink(url, name, userId, expiresAt, customAlias);
  await incrementLinkCreation(userId);
  res.status(201).json(newLink);
});
export const getLinkController = asyncHandler(async (req: any, res: any) => {
  const { shortCode } = req.params;
  console.log(shortCode);
  if (!shortCode) {
    throw new ApiError(400, "Short code is required");
  }
  const link = await getLink(shortCode);
  res.status(200).json(link);
});
export const getUserLinksController = asyncHandler(
  async (req: any, res: any) => {
    const userId = req.userId;
    const { page, limit } = req.query;
    if (page && isNaN(parseInt(page))) {
      throw new ApiError(400, "Page must be a number");
    }
    if (limit && isNaN(parseInt(limit))) {
      throw new ApiError(400, "Limit must be a number");
    }

    const {links,totalLinks} = await getUserLinks(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );
    res.status(200).json({links,totalLinks});
  },
);
export const getTopLinksController = asyncHandler(async (req: any, res: any) => {
  const userId = req.userId;
  const topLinks = await getTopLinks(userId);
  res.status(200).json(topLinks);
});
export const updateLinkController = asyncHandler(async (req: any, res: any) => {
  const { linkId } = req.params;
  if (!linkId) {
    throw new ApiError(400, "Link ID is required");
  }
  const userId = req.userId;
  const { url, name, expiresAt } = req.body;
  const updatedLink = await updateLink(linkId, userId, {
    url,
    name,
    expiresAt,
  });
  res.status(200).json(updatedLink);
});
export const deleteLinkController = asyncHandler(async (req: any, res: any) => {
  const { linkId } = req.params;
  if (!linkId) {
    throw new ApiError(400, "Link ID is required");
  }
  const userId = req.userId;
  const deletedLink = await deleteLink(linkId, userId);
  res.status(200).json(deletedLink);
});
