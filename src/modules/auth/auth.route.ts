import { Router } from "express";
import {
  signupController,
  loginController,
  logoutController,
  getUserController,
  updateUserPasswordController,
  
} from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.put("/updatePassword",  updateUserPasswordController);
router.post("/logout", protect, logoutController);
router.get("/me", protect, getUserController);


export default router;
