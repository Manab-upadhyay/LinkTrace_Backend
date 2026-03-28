import http from "http";
import ConnectToDatabase from "./config/db.config";
import logger from "./utils/logger";
import app from "./app";
import { initSocket } from "./config/socket";
import { registerLiveTrackingGateway } from "./modules/liveTracking/liveTracking.gateway";

const PORT = process.env.PORT || 5000;

ConnectToDatabase();

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
registerLiveTrackingGateway(io);

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
