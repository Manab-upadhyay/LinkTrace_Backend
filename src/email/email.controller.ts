import { sendWelcomeEmail, SendEmailToAuthority, SendFeedBackResponseEmail , sendPasswordResetEmail} from "./email.service";
import { asyncHandler } from "../utils/asynchandler";
import { generateOTP } from "../utils/generateOTP";
import { SendOtp } from "./email.service";
import {redis} from "../config/cache.redis"
import bcrypt from "bcrypt";

export const sendWelcomeEmailController = asyncHandler(async (req: any, res: any) => {
    const { email, name } = req.body;
    await sendWelcomeEmail(email, name);
    return res.status(200).json({ message: "Welcome email sent successfully" });
});

export const sendOtpController = asyncHandler(async (req: any, res: any) => {
    const { email } = req.body;
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    
 await redis.set(
  `otp:${email}`,
  hashedOtp,
  "EX",
  900 // 15 minutes
);
    await SendOtp(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
});
export const sendPasswordResetEmailController = asyncHandler(async (req: any, res: any) => {
    const { email, resetToken } = req.body;
    await sendPasswordResetEmail(email, resetToken);
    return res.status(200).json({ message: "Password reset email sent successfully" });
});
export const SendFeedBackEmailResponseController = asyncHandler(async (req: any, res: any) => {
    const { email, feedback } = req.body;
    await SendFeedBackResponseEmail(email, feedback);
    return res.status(200).json({ message: "Feedback response email sent successfully" });
});
export const SendEmailToAuthorityController = asyncHandler(async (req: any, res: any) => {
    const { feedback } = req.body;
    await SendEmailToAuthority(feedback);
    return res.status(200).json({ message: "Email to authority sent successfully" });
});