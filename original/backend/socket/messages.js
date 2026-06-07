import { activeUsers, allUsers, conversations } from '../services/state.js';
import { getRoomId } from '../services/room.js';

export const registerMessageHandlers = (io, socket) => {
  socket.on('send_private_message', (data) => {
    const { to, message, timestamp } = data;
    const from = activeUsers.get(socket.id);

    if (!from || !to) return;

    const recipientStatus = allUsers.get(to);
    if (!recipientStatus || !recipientStatus.isOnline) return;

    const roomId = getRoomId(from, to);

    if (!conversations.has(roomId)) {
      conversations.set(roomId, []);
    }

    const messageData = { from, to, message, timestamp };
    conversations.get(roomId).push(messageData);

    let recipientSocketId = null;
    for (const [sid, uname] of activeUsers.entries()) {
      if (uname === to) {
        recipientSocketId = sid;
        break;
      }
    }

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_private_message', messageData);
    }

    socket.emit('receive_private_message', messageData);
  });

  socket.on('fetch_chat_history', (otherUsername, callback) => {
    const username = activeUsers.get(socket.id);
    if (!username) return;

    const roomId = getRoomId(username, otherUsername);
    const history = conversations.get(roomId) || [];

    if (typeof callback === 'function') callback(history);
  });
};