import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  uploadMiddleware,
  uploadAvatarController,
} from "./media.controller";

const router = Router();

router.post("/upload-image", protect, uploadMiddleware, uploadAvatarController);

export default router;
