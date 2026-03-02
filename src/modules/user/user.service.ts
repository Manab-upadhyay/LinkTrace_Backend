import User from "../auth/auth.model"

export async function updateUserDetails(userId: string, data: any) {
  const updateFields: any = {};

  if (data.name !== undefined) {
    updateFields.name = data.name;
  }

  if (data.bio !== undefined) {
    updateFields.bio = data.bio;
  }

  if (data.preferences?.emailNotification !== undefined) {
    updateFields["preferences.emailNotification"] =
      data.preferences.emailNotification;
  }

  if (data.preferences?.marketingEmailNotification !== undefined) {
    updateFields["preferences.marketingEmailNotification"] =
      data.preferences.marketingEmailNotification;
  }

  return await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true }
  );
}