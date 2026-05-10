const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// State
const activeUsers = new Map(); // socket.id -> username
const allUsers = new Map(); // username -> { isOnline: boolean }
const conversations = new Map(); // roomId -> [{ sender, text, timestamp }]

const getRoomId = (userA, userB) => {
  return [userA, userB].sort().join('_');
};

const emitUserList = () => {
  const userList = Array.from(allUsers.entries()).map(([username, status]) => ({
    username,
    isOnline: status.isOnline
  }));
  io.emit('users_update', userList);
};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Login event
  socket.on('login', (username, callback) => {
    // Check if someone is CURRENTLY online with this name
    const isAlreadyOnline = Array.from(activeUsers.values()).includes(username);
    
    if (isAlreadyOnline) {
      if (typeof callback === 'function') callback({ success: false, error: 'Username already taken and is currently online' });
      return;
    }

    activeUsers.set(socket.id, username);
    allUsers.set(username, { isOnline: true });

    if (typeof callback === 'function') callback({ success: true });

    // Broadcast updated users list
    emitUserList();
  });

  // Private message event
  socket.on('send_private_message', (data) => {
    const { to, message, timestamp } = data;
    const from = activeUsers.get(socket.id);
    
    if (!from || !to) return; // User must be logged in

    // Requirement: Only send if recipient is online
    const recipientStatus = allUsers.get(to);
    if (!recipientStatus || !recipientStatus.isOnline) {
      return; // Or emit error
    }

    const roomId = getRoomId(from, to);
    if (!conversations.has(roomId)) {
      conversations.set(roomId, []);
    }

    const messageData = { from, to, message, timestamp };
    conversations.get(roomId).push(messageData);

    // Find recipient socket id
    let recipientSocketId = null;
    for (const [sid, uname] of activeUsers.entries()) {
      if (uname === to) {
        recipientSocketId = sid;
        break;
      }
    }

    // Emit to recipient
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_private_message', messageData);
    }
    // Emit back to sender (to confirm it was sent)
    socket.emit('receive_private_message', messageData);
  });

  // Fetch history event
  socket.on('fetch_chat_history', (otherUsername, callback) => {
    const username = activeUsers.get(socket.id);
    if (!username) return;

    const roomId = getRoomId(username, otherUsername);
    const history = conversations.get(roomId) || [];
    
    if (typeof callback === 'function') callback(history);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    const username = activeUsers.get(socket.id);
    if (username) {
      activeUsers.delete(socket.id);
      allUsers.set(username, { isOnline: false });
      emitUserList();
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
