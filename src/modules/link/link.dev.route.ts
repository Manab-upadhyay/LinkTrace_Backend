import { Router } from "express";
import { apiKeyAuth } from "../../middleware/apikeyAuth.middleware";
import { validate } from "../../middleware/validate.middlewere";
import {
  addLinkController,
  getLinkController,
  deleteLinkController,
  getUserLinksController,
} from "./link.controller";
import {
  createLinkSchema,
  redirectSchema,
} from "../../validator/link.validator";
import {
  checkApiLimit,
  checkLinkLimit,
} from "../../middleware/usage.middleware";


const router = Router();

// All routes here require API key

router.use(apiKeyAuth);
router.use(checkApiLimit);

// Create link via API
router.post(
  "/links",
  validate(createLinkSchema),
  checkLinkLimit,
  addLinkController,
);

// Get link info
router.get("/links/:shortCode", validate(redirectSchema), getLinkController);
router.get("/links", getUserLinksController);

// Delete link
router.delete("/links/:linkId", deleteLinkController);

export default router;
