import { io } from "socket.io-client";
import { API_ROOT_URL } from "./axios";

// API_ROOT_URL is already clean (http://localhost:9999)
const socketUrl = API_ROOT_URL;

export const socket = io(socketUrl, {
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling']
});

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
    console.log("Socket disconnected");
});
