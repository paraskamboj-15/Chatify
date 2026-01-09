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
    if (userId && userId !== "undefined") userSocketMap[userId] = socket.id;

    // Broadcast online status
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // --- NEW: Typing Indicators ---
    socket.on("typing", ({ receiverId }) => {
        const socketId = userSocketMap[receiverId];
        if (socketId) io.to(socketId).emit("userTyping", userId);
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const socketId = userSocketMap[receiverId];
        if (socketId) io.to(socketId).emit("userStoppedTyping", userId);
    });

    // --- NEW: Read Receipts ---
    socket.on("markMessagesAsRead", async ({ senderId, receiverId }) => {
        // Find messages from sender to receiver that are unread
        // (Ideally, this DB update happens in a controller, but for real-time speed we can emit first)
        const socketId = userSocketMap[senderId];
        if (socketId) io.to(socketId).emit("messagesRead", { by: receiverId });
    });

    
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