import { Request, Response } from "express";
import { getCurrentUsage } from "./overAllUsage.service";

export const getUsageController = async (req: any, res: Response) => {
  const usage = await getCurrentUsage(req.user._id);


  res.status(200).json(usage);
};
