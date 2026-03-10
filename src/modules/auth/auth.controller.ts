import {
  login,
  signup,
  logout,
  getUserById,
  updatePassword,
  verifySignupOtp,
} from "./auth.service";
import { asyncHandler } from "../../utils/asynchandler";

// Step 1: Signup → sends OTP
const signupController = asyncHandler(async (req: any, res: any) => {
  const { email, password, name } = req.body;
  const result = await signup(email, password, name);
  return res.status(200).json(result);
});

// Step 2: Verify OTP → creates user + sets cookie
const verifySignupController = asyncHandler(async (req: any, res: any) => {
  const { email, otp } = req.body;
  const { token, user } = await verifySignupOtp(email, otp);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
  });

  return res
    .status(201)
    .json({ message: "Account created successfully", user });
});

const loginController = asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  const { token, user } = await login(email, password);
console.log(process.env.NODE_ENV)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ message: "Login successful", user });
});

const logoutController = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;
  await logout(userId);
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
  });
  return res.status(200).json({ message: "Logout successful" });
});

const getUserController = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;
  const user = await getUserById(userId);
  return res.status(200).json(user);
});

const updateUserPasswordController = asyncHandler(
  async (req: any, res: any) => {
    const { email, newPassword } = req.body;
    await updatePassword(email, newPassword);
    return res
      .status(200)
      .json({ message: "Password updated successfully" });
  }
);

export {
  signupController,
  verifySignupController,
  loginController,
  logoutController,
  getUserController,
  updateUserPasswordController,
};
