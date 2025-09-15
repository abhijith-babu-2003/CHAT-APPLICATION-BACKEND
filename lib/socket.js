// lib/socket.js
import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);

    const userId = socket.handshake.query.userId
    console.log("👤 User ID from query:", userId);

    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id
        console.log("📝 Updated userSocketMap:", userSocketMap);
        
        // Emit to all clients about online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        console.log("📢 Emitted online users:", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
        console.log('❌ A user disconnected:', socket.id);
        if (userId && userId !== "undefined") {
            delete userSocketMap[userId]
            console.log("📝 Updated userSocketMap after disconnect:", userSocketMap);
            io.emit("getOnlineUsers", Object.keys(userSocketMap))
            console.log("📢 Emitted online users after disconnect:", Object.keys(userSocketMap));
        }
    })

    // Add error handling
    socket.on("error", (error) => {
        console.log("❌ Socket error:", error);
    })
})

// Add connection error handling
io.engine.on("connection_error", (err) => {
    console.log("❌ Connection error:", err.req);
    console.log("❌ Error code:", err.code);
    console.log("❌ Error message:", err.message);
    console.log("❌ Error context:", err.context);
});

export { io, app, server }