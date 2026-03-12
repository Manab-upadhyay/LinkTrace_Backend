import { Router } from "express";
import {
  signupController,
  verifySignupController,
  loginController,
  logoutController,
  getUserController,
  updateUserPasswordController,
  googleLoginController,
  verifyUpdatePasswordController,
  resendForgetPasswordOtpController,
  resendSingupOtpController
} from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";

const router = Router();

// Public
router.post("/signup", signupController);
router.post("/verify-signup", verifySignupController);
router.post("/login", loginController);
router.post("/google", googleLoginController);
router.put("/updatePassword", updateUserPasswordController);
router.post("/verify-update-password", verifyUpdatePasswordController);
router.post("/resend-signup-otp", resendSingupOtpController)

router.post("/resend-forget-password-otp", resendForgetPasswordOtpController)
// Protected
router.post("/logout", protect, logoutController);
router.get("/me", protect, getUserController);

export default router;
