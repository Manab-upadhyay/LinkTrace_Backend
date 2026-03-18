import { redirect } from "./redirect.service";
import { asyncHandler } from "../../utils/asynchandler";
import { ApiError } from "../../utils/ApiError";

export const redirectController = asyncHandler(async (req: any, res: any) => {
  const shortCode = req.params.shortCode;
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "";

  const userAgent = req.headers["user-agent"] || "";
  if (!shortCode) {
    throw new ApiError(400, "Short code is required");
  }
  const start = performance.now();
  const url = await redirect(shortCode, ip, userAgent, req.userId);
  const duration = performance.now() - start;

  res.setHeader('Server-Timing', `db;dur=${duration};desc="Database/Cache Lookup"`);

  return res.redirect(url);
});
