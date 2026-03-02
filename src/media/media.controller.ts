import { upload, uploadToCloudinary } from "./media.service";
import { asyncHandler } from "../utils/asynchandler";
import User from "../modules/auth/auth.model";

// Multer middleware for a single "avatar" field
export const uploadMiddleware = upload.single("image");

export const uploadAvatarController = asyncHandler(
  async (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "LinkTrace/images"
    );

    // Persist the avatar URL on the user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: url, avatarPublicId: publicId } },
      { new: true }
    );

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: url,
      user: updatedUser,
    });
  }
);
