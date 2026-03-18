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
  resendSingupOtpController,
  getCsrfTokenController
} from "./auth.controller";
import { protect } from "../../middleware/auth.middleware";

const authRouter = Router();

// Public
authRouter.get("/csrf-token", getCsrfTokenController);
authRouter.post("/signup", signupController);
authRouter.post("/verify-signup", verifySignupController);
authRouter.post("/login", loginController);
authRouter.post("/google", googleLoginController);
authRouter.put("/updatePassword", updateUserPasswordController);
authRouter.post("/verify-update-password", verifyUpdatePasswordController);
authRouter.post("/resend-signup-otp", resendSingupOtpController)

authRouter.post("/resend-forget-password-otp", resendForgetPasswordOtpController)
// Protected
authRouter.post("/logout", protect, logoutController);
authRouter.get("/me", protect, getUserController);

export default authRouter;
