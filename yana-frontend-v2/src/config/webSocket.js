// socket.js
import { io } from "socket.io-client";

let socket = null;
const baseURL = import.meta.env.VITE_BASE_URL;

export const initializeSocket = (token) => {
    socket = io(baseURL, {
        auth: {
            token: token,
        },
        transports: ["websocket"],
        autoConnect: true,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("🚨 Socket connect error:", error.message);
    });

    socket.on("error", (error) => {
        console.log("❗Socket error:", error?.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const emitSocketEvent = (eventName, payload, callback = null) => {
    if (!socket) {
        console.warn("Socket not initialized");
        return;
    }
    // console.log(📤 Emitting '${eventName}', payload);
    socket.emit(eventName, payload, callback);
};

export const onSocketEvent = (eventName, handler) => {
    if (!socket) {
        console.warn("Socket not initialized");
        return;
    }
    socket.on(eventName, handler);
};

export const offSocketEvent = (eventName, handler) => {
    if (!socket) {
        console.warn("Socket not initialized");
        return;
    }
    socket.off(eventName, handler);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        console.log("🔌 Socket manually disconnected");
    }
};