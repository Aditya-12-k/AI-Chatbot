import { Server } from "socket.io";
import socketAuthMiddleware from "../middlewares/socketAuth.middleware.js";

// Initialize Socket.IO on HTTP server
const initializeSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    // Authenticate every socket connection
    io.use(socketAuthMiddleware);

    // Handle authenticated connections
    io.on("connection", (socket) => {

        console.log("========== SOCKET CONNECTED ==========");
        console.log("Socket ID:", socket.id);
        console.log("Authenticated User:", socket.user);
        console.log("======================================");

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });

    });

    return io;
};

export default initializeSocket;