import { Server } from "socket.io";
import { registerLoginHandlers } from "./login.js";
import { registerMessageHandlers } from "./messages.js";
import { activeUsers, allUsers } from "../services/state.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Register login handlers
    registerLoginHandlers(io, socket);

    // Register message handlers
    registerMessageHandlers(io, socket);

    // Handle user disconnect
    socket.on("disconnect", () => {
      const username = activeUsers.get(socket.id);
      if (username) {
        activeUsers.delete(socket.id);
        allUsers.set(username, {
          isOnline: false,
        });

        // Broadcast the updated user list to all connected clients
        const userList = Array.from(allUsers.entries()).map(([name, status]) => ({
          username: name,
          isOnline: status.isOnline,
        }));
        io.emit("users_update", userList);
      }
    });
  });
};

export default setupSocket;

