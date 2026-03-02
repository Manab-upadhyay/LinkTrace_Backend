import User from "./auth.model";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.utils";
import { ApiError } from "../../utils/ApiError";

async function comparePassword(this: any, password: string) {
  return await bcrypt.compare(password, this.password);
}
async function signup(email: string, password: string, name: string) {
  const exitingUser = await User.findOne({ email });

  if (exitingUser) {
    throw new Error("User already exists");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }
  const user = new User({ email, password, name });
  await user.save();
  const token = generateToken(user._id.toString(), user.tokenversion);

  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  return { user: safeUser, token };
}
async function login(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isMatch = await comparePassword.call(user, password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  const token = generateToken(user._id.toString(), user.tokenversion);
  const safeUser = {
    id: user._id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    image: user.avatar
  };
  return { user: safeUser, token };
}
async function logout(userId: string) {
  console.log("Logout called for userId:", userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  user.tokenversion += 1;
  await user.save();
}
async function getUserById(userId: string) {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
async function updatePassword( email:string, newPassword: string){
  const user = await User.findOne({email})
  if (!user) {
    throw new Error("User not found");
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }
  user.password = newPassword;
  user.tokenversion += 1;
  await user.save();


}

export { signup, login, logout, getUserById, updatePassword };
