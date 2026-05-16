const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
    },
});

// ***** State Management *****
const activeUsers = new Map();
const allUsers = new Map();
const conversations = new Map();

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