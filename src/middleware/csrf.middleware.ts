import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import crypto from "crypto";

/**
 * CSRF Protection Middleware
 * This middleware implements the Double Submit Cookie pattern.
 * It checks for a custom header 'X-CSRF-Token' on mutating requests.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // 1. Ignore safe methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // 2. Get tokens from cookie and header
  const csrfCookie = req.cookies["csrfToken"];
  const csrfHeader = req.headers["x-csrf-token"];

  // 3. Simple custom header check (if header is present, it's generally safe due to CORS)
  // But for full Double Submit pattern, we compare with cookie.
  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    throw new ApiError(403, "CSRF token mismatch or missing");
  }

  next();
};

/**
 * Helper to generate and set CSRF cookie
 */
export const setCsrfCookie = (res: Response) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false, // Needs to be readable by frontend JS
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
    path: "/",
  });
  return token;
};
