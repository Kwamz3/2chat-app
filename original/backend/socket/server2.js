import express from 'express'
import http from 'http'
import { Server } from 'http'
import cors from 'cors'

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

// *** State ***
const activeUsers = new Map();
const allUsers = new Map();
const conversations = new Map();

const getRoomId = (userA, userB) =>{
    return [userA, userB].sort().join('_');
};