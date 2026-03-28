import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { getRecentClicksController } from "./liveTracking.controller";

const liveTrackingRoute = Router();

liveTrackingRoute.get("/:linkId/recent", protect, getRecentClicksController);

export default liveTrackingRoute;
