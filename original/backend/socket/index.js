import { Server } from "socket.io";
import { registerLoginHandlers } from "./login.js";
import { registerMessageHandlers } from "./messages.js";
import { activeUsers, allUsers, conversations } from "../services/state.js";
import { getRoomId } from "../services/room.js";

export const broadcastUserList = (io) => {
  for (const [socketId, socket] of io.of("/").sockets.entries()) {
    const currentUsername = activeUsers.get(socketId);
    if (!currentUsername) continue;

    const userList = Array.from(allUsers.entries()).map(([name, status]) => {
      const roomId = getRoomId(currentUsername, name);
      const history = conversations.get(roomId) || [];
      const lastMessage = history.length > 0 ? history[history.length - 1] : null;

      return {
        username: name,
        isOnline: status.isOnline,
        lastSeen: status.lastSeen || null,
        lastMessage: lastMessage,
      };
    });

    socket.emit("users_update", userList);
  }
};

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Register login handlers with broadcast callback
    registerLoginHandlers(io, socket, () => broadcastUserList(io));

    // Register message handlers with broadcast callback
    registerMessageHandlers(io, socket, () => broadcastUserList(io));

    // Handle user disconnect
    socket.on("disconnect", () => {
      const username = activeUsers.get(socket.id);
      if (username) {
        activeUsers.delete(socket.id);
        allUsers.set(username, {
          isOnline: false,
          lastSeen: new Date().toISOString(),
        });

        // Broadcast the updated user list to all connected clients
        broadcastUserList(io);
      }
    });
  });
};

export default setupSocket;


