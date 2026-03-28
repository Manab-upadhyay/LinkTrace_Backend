import { Socket, Server as SocketIOServer } from "socket.io";
import { verifyToken } from "../../utils/jwt.utils";
import User from "../auth/auth.model";
import Link from "../link/link.model";
import logger from "../../utils/logger";
import cookie from "cookie";

/**
 * Attaches socket.io authentication + room-join logic to the io server.
 * Call this once after initSocket().
 */
export function registerLiveTrackingGateway(io: SocketIOServer) {
  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie ?? "";
      const cookies = cookie.parse(rawCookies);
      const token = cookies["token"];

      if (!token) {
        return next(new Error("Not authenticated"));
      }

      const decoded = verifyToken(token) as any;
      const user = await User.findById(decoded.userId);

      if (!user || user.tokenversion !== decoded.tokenVersion) {
        return next(new Error("Not authenticated"));
      }

      // Attach userId to the socket for later ownership checks
      (socket as any).userId = user._id.toString();
      next();
    } catch (err: any) {
      logger.error("Socket auth error:", err);
      next(new Error("Not authenticated"));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Client emits { linkId } to start receiving live events
    socket.on("join", async ({ linkId }: { linkId: string }) => {
      try {
        if (!linkId) {
          socket.emit("error", { message: "linkId is required" });
          return;
        }

        // Verify the link belongs to this user
        const link = await Link.findOne({ _id: linkId, userId });
        if (!link) {
          socket.emit("error", { message: "Link not found or access denied" });
          return;
        }

        await socket.join(`link:${linkId}`);
        logger.info(`Socket ${socket.id} joined room link:${linkId}`);
        socket.emit("joined", { linkId });
      } catch (err) {
        logger.error("Socket join error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Client emits { linkId } to stop receiving events for a link
    socket.on("leave", ({ linkId }: { linkId: string }) => {
      if (linkId) {
        socket.leave(`link:${linkId}`);
        logger.info(`Socket ${socket.id} left room link:${linkId}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}
