import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: ["http://localhost:3000"],
        origin: "*",
        methods: ["GET", "POST"],
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId != "undefined") userSocketMap[userId] = socket.id;

    // Send online users list to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle Call Events
    socket.on("callUser", (data) => {
        io.to(userSocketMap[data.userToCall]).emit("incomingCall", { 
            signal: data.signalData, 
            from: data.from, 
            name: data.name 
        });
    });

    socket.on("answerCall", (data) => {
        io.to(userSocketMap[data.to]).emit("callAccepted", data.signal);
    });

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };