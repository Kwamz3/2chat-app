import { allUsers, activeUsers } from "../services/state.js";

const registerLoginHandlers = (io, socket) => {
  socket.on("login", (username, callback) => {
    const isAlreadyOnline = Array.from(activeUsers.values()).includes(username);

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
    });

    if (typeof callback === "function") {
      callback({
        success: true,
      });
    }

    const userList = Array.from(allUsers.entries()).map(([name, status])=>({
        username: name,
        isOnline: status.isOnline
    }))

    io.emit('users_update', userList)
  });
};
