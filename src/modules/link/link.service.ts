import Link from "./link.model";
import generateShortCode from "../../utils/generateShortcode";
import { ApiError } from "../../utils/ApiError";
async function addLink(
  link: string,
  name: string,
  userId: string,
  expiresAt?: Date,
  customAlias?: String,
) {
  try {
    let shortCode: String;
    if (customAlias) {
      let checkIsAliasTaken = await Link.findOne({
        shortCode: customAlias,
        isActive: true,
      });
      if (checkIsAliasTaken) {
        throw new ApiError(400, "Alias is already taken");
      }
      shortCode = customAlias;
    } else {
      let existsingLink;
      do {
        shortCode = generateShortCode();
        existsingLink = await Link.findOne({ shortCode });
      } while (existsingLink);
    }
    const newLink = new Link({
      url: link,
      name,
      shortCode,
      userId,
      expiresAt,
    });
    await newLink.save();
    return newLink;
  } catch (error) {
    throw error;
  }
}
async function getLink(shortCode: string) {
  const link = await Link.findOne({ shortCode, isActive: true });
  if (!link) {
    throw new Error("Link not found");
  }
  return link;
}
async function getUserLinks(
  userId: string,
  page: number ,
  limit: number 
) {
  const links = await Link.find({ userId, isActive: true })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
    const totalLinks = await Link.countDocuments({ userId, isActive: true });
  return {links, totalLinks};
}
async function deleteLink(linkId: string, userId: string) {
  const deletedLink = await Link.findOneAndUpdate(
    { _id: linkId },
    { $set: { isActive: false } },
  );
  if (!deletedLink) {
    throw new Error("Link not found or unauthorized");
  }
  return deletedLink;
}
async function getTopLinks(userId:string){
  const topLinks = await Link.find({ userId })
    .sort({ clicks: -1 })
    .limit(5)
    .select("name url shortCode clicks createdAt").lean();

  return topLinks;
}
async function updateLink(
  linkId: string,
  userId: string,
  updates: { url?: string; name?: string; expiresAt?: Date },
) {
  const updatedLink = await Link.findOneAndUpdate(
    { _id: linkId, userId },
    { $set: updates },
    { new: true },
  );
  if (!updatedLink) {
    throw new Error("Link not found or unauthorized");
  }
  return updatedLink;
}
export { addLink, getLink, getUserLinks, deleteLink, updateLink, getTopLinks };
