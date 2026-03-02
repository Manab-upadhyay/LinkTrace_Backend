import { updateUserDetails } from "./user.service";
import { asyncHandler } from "../../utils/asynchandler";

export const updateUserDetailsController = asyncHandler (async(req: any, res: any)=>{
const updatedUser = await updateUserDetails(req.user._id, req.body);
  res.status(200).json(updatedUser);
})
