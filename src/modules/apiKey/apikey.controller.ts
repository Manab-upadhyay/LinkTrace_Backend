import {
  createApiKey,
  validateApiKey,
  revokeApiKey,
  getApiKeysForUser,
} from "./apiKey.service";
import { asyncHandler } from "../../utils/asynchandler";
import { Request, Response } from "express";

const getApiKeysController = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const apiKeys = await getApiKeysForUser(userId);
  
  res.status(200).json({ success: true, apiKeys });

});
const createApiContoller = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const { name } = req.body;
  const result = await createApiKey(userId, name, 2);
  res.status(201).json({
    success: true,
    apiKey: result.apiKey,
    fullKey: result.fullKey, // show once
  });
});
const revokeApiKeyController = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user._id;
  const { apiKeyId } = req.params;
  await revokeApiKey(userId, apiKeyId);
  res.status(200).json({ message: "api key deleted" });
});

export { createApiContoller, revokeApiKeyController, getApiKeysController };
