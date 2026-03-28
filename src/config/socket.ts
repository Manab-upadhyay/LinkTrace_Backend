import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Redis } from "ioredis";
import logger from "../utils/logger";

let io: SocketIOServer;

const allowedOrigins = [
  "http://localhost:5173",
  "https://link-trace-2k76.vercel.app",
];

export function initSocket(httpServer: HttpServer): SocketIOServer {
    console.log(`[SOCKET] Initializing socket.io server... (Allowed: ${allowedOrigins})`);
    io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Physical connection established: ${socket.id}`);
    socket.on("ping", () => {
      console.log(`[SOCKET] Received ping from ${socket.id}`);
      socket.emit("pong", { time: new Date().toISOString() });
      console.log(`[SOCKET] Sent pong to ${socket.id}`);
    });
  });

  // Dedicated subscriber Redis client — pub/sub mode blocks other commands
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  const useTls = redisUrl.startsWith("rediss://");

  const subscriber = new Redis(redisUrl, {
    ...(useTls ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 500, 10000),
  });

  subscriber.on("connect", () => logger.info("🟢 Redis subscriber (live tracking) connected"));
  subscriber.on("error", (err) => logger.error("🔴 Redis subscriber error:", err));

  // Subscribe to ALL link channels with pattern
  subscriber.psubscribe("live:clicks:*", (err) => {
    if (err) logger.error("Failed to psubscribe live:clicks:*", err);
    else logger.info("👂 Subscribed to live:clicks:* pattern");
  });

  subscriber.on("pmessage", (_pattern, channel, message) => {
    // channel = "live:clicks:{linkId}"
    const linkId = channel.replace("live:clicks:", "");
    try {
      const payload = JSON.parse(message);
      io.to(`link:${linkId}`).emit("click", payload);
      console.log("click", payload);
    } catch {
      logger.error("Failed to parse live click message", { channel, message });
    }
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.io not initialised — call initSocket first");
  return io;
}
