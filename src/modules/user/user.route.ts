import { updateUserDetailsController } from "./user.controller";
import { Router } from "express";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

router.put("/updateUser", protect, updateUserDetailsController);

export default router;