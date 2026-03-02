import { login, signup, logout, getUserById, updatePassword } from "./auth.service";

import { asyncHandler } from "../../utils/asynchandler";

const signupController = asyncHandler(async (req: any, res: any) => {
  const { email, password, name } = req.body;

  const { token, user } = await signup(email, password, name);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(201).json({ message: "User created successfully", user });
});
const loginController = asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  const { token, user } = await login(email, password);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Login successfuly", user });
});
const logoutController = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;

  await logout(userId);
  res.clearCookie("token");
  return res.status(200).json("Logout successful");
});
const getUserController = asyncHandler(async (req: any, res: any) => {
  const userId = req.user._id;

  const user = await getUserById(userId);
  return res.status(200).json(user);
});
const updateUserPasswordController = asyncHandler(async(req: any, res: any)=>{
  const {email, newPassword} = req.body;
  const updatedUser = await updatePassword(email, newPassword);
  return res.status(200).json(updatedUser);
})

export {
  signupController,
  loginController,
  logoutController,
  getUserController,
  updateUserPasswordController
};
