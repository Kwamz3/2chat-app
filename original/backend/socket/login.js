import { allUsers, activeUsers } from "../services/state.js";

export const registerLoginHandlers = (io, socket, broadcastUserList) => {
  socket.on("login", (username, callback) => {
    const isAlreadyOnline = Array.from(activeUsers.values()).some(
      (activeName) => activeName.toLowerCase() === username.toLowerCase(),
    );

    if (isAlreadyOnline) {
      if (typeof callback === "function") {
        callback({
          success: false,
          error: "Username already taken and is currently online",
        });
      }
      return;
    }

    activeUsers.set(socket.id, username);
    allUsers.set(username, {
      isOnline: true,
      lastSeen: null,
    });

    if (typeof callback === "function") {
      callback({
        success: true,
      });
    }

    if (typeof broadcastUserList === "function") {
      broadcastUserList();
    }
  });
};
