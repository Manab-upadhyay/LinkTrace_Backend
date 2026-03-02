// src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route";
import linkRoutes from "./modules/link/link.route";
import redirectRoutes from "./modules/redirect/redirect.route";
import developersRoute from "./modules/link/link.dev.route";
import analyticsRoutes from "./modules/analytics/analytics.route";
import getApiUsageRoute from "./modules/apiUsage/apiUsage.route";
import getOverallUsage from "./modules/overallUsage/overAllUsage.route";
import generateApiKey from "./modules/apiKey/apiKey.route";
import dashbord from "./modules/dashboard/dashboard.route";
import userRoutes from "./modules/user/user.route";
import mediaRoutes from "./media/media.route";
import { startApiUsageWorker } from "./modules/apiUsage/worker/apiUsage.worker";
import errorMiddleware from "./middleware/error.middleware";
import { authRateLimiter } from "./middleware/rateLimiter.middleware";
import { apiRateLimiter } from "./middleware/rateLimiter.middleware";

const app = express();

/* =======================
   GLOBAL MIDDLEWARE
======================= */

app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */
startApiUsageWorker();
app.get("/", (req, res) => {
  res.send("URL Shortener API running 🚀");
});
app.use("/api/auth", authRateLimiter, authRoutes);

// Dashboard (JWT)
app.use("/api/links", apiRateLimiter, linkRoutes);
app.use("/api/analytics", apiRateLimiter, analyticsRoutes);
app.use("/api/analytics", apiRateLimiter, getApiUsageRoute);
app.use("/api/usage", apiRateLimiter, getOverallUsage);
app.use("/api/api-keys", apiRateLimiter, generateApiKey);
app.use("/api/dashboard", apiRateLimiter, dashbord);
app.use("/api/user", apiRateLimiter, userRoutes);
app.use("/api/media", apiRateLimiter, mediaRoutes);
// Developer API (versioned)
app.use("/api/v1/links", apiRateLimiter, developersRoute);

// Public redirect
app.use("/", apiRateLimiter, redirectRoutes);
app.use(errorMiddleware); // Global error handler (LAST)

/* =======================
   ERROR HANDLER (LAST)
======================= */

export default app;
