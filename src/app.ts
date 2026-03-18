// src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { stream } from "./utils/logger";
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
import emailRoute from "./email/email.route";

import { startApiUsageWorker } from "./modules/apiUsage/worker/apiUsage.worker";
import errorMiddleware from "./middleware/error.middleware";
import { authRateLimiter } from "./middleware/rateLimiter.middleware";
import { apiRateLimiter } from "./middleware/rateLimiter.middleware";
import { csrfProtection } from "./middleware/csrf.middleware";

const app = express();

// Trust the reverse proxy (e.g. Railway) so rate limits work correctly with X-Forwarded-For
app.set("trust proxy", 1);

/* =======================
   GLOBAL MIDDLEWARE
======================= */

app.use(helmet());
app.use(express.json());
app.use(morgan("combined", { stream }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-trace-2k76.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(cookieParser());


/* =======================
   ROUTES
======================= */
startApiUsageWorker();
app.get("/", (req, res) => {
  res.send("URL Shortener API running");
});

app.get("/api/health", async (req, res) => {
  try {
    const { redis } = await import("./config/cache.redis");
    const mongoose = (await import("mongoose")).default;
    
    const redisStatus = redis.status;
    const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.status(200).json({ 
      status: "ok", 
      redis: redisStatus,
      mongodb: mongoStatus,
      server: "running"
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/email", emailRoute);
app.use("/", apiRateLimiter, redirectRoutes);
app.use(csrfProtection);
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

app.use(errorMiddleware); // Global error handler (LAST)

/* =======================
   ERROR HANDLER (LAST)
======================= */

export default app;
