import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: "*",
    method: ["GET", "POST"],
  });
};

export default setupSocket;
