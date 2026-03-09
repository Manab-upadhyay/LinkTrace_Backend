import {
  addLinkController,
  getLinkController,
  getUserLinksController,
  deleteLinkController,
  getTopLinksController,
} from "./link.controller";
import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middlewere";
import {
  createLinkSchema,
  redirectSchema,
} from "../../validator/link.validator";
import { checkApiLimit } from "../../middleware/usage.middleware";
const router = Router();
router.post(
  "/addLink",
  protect,
  validate(createLinkSchema),
  checkApiLimit,
  addLinkController,
);
router.get(
  "/getLink/:shortCode",
  protect,
  validate(redirectSchema),
  getLinkController,
);
router.get("/getUserLinks", protect, getUserLinksController);
router.get("/getTopLinks", protect, getTopLinksController);
router.delete("/deleteLink/:linkId", protect, deleteLinkController);

export default router;
