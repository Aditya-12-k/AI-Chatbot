
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
    createChat,
    getUserChats,
    getChatMessages,
    deleteChat,
    sendMessage
} from "../controllers/chat.controller.js";

const router = express.Router();

// Create new chat
router.post("/create", authMiddleware, createChat);

// Get all user chats
router.get("/", authMiddleware, getUserChats);

// Get messages of specific chat
router.get("/:chatId/messages", authMiddleware, getChatMessages);

// Delete specific chat
router.delete("/delete/:chatId", authMiddleware, deleteChat);

// Send message and generate AI response
router.post("/message", authMiddleware, sendMessage);

export default router;
