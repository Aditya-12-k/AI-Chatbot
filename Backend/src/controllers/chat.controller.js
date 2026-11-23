
// Import required models and AI service
import { generateAIResponse } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


// ==========================================
// 1. CREATE NEW CHAT
// ==========================================

export const createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.userId;

        // Create a new chat for logged-in user
        const newChat = await chatModel.create({
            user: userId,
            title: title || "New Chat"
        });

        return res.status(201).json({
            success: true,
            message: "Chat created successfully",
            chat: newChat
        });

    } catch (error) {
        console.error("Create Chat Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create chat"
        });
    }
};


// ==========================================
// 2. GET ALL USER CHATS
// ==========================================

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch all chats belonging to logged-in user
        const chats = await chatModel
            .find({ user: userId })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Chats fetched successfully",
            chats
        });

    } catch (error) {
        console.error("Get Chats Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chats"
        });
    }
};


// ==========================================
// 3. GET MESSAGES OF SPECIFIC CHAT
// ==========================================

export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;

        // Check whether chat belongs to logged-in user
        const chat = await chatModel.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Fetch all messages in chronological order
        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            messages
        });

    } catch (error) {
        console.error("Get Chat Messages Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages"
        });
    }
};


// ==========================================
// 4. DELETE CHAT
// ==========================================

export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.userId;

        // Verify chat ownership
        const chat = await chatModel.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Delete all messages belonging to this chat
        await messageModel.deleteMany({
            chat: chatId
        });

        // Delete the chat itself
        await chatModel.findByIdAndDelete(chatId);

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully"
        });

    } catch (error) {
        console.error("Delete Chat Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });
    }
};


// ==========================================
// 5. SEND MESSAGE AND GENERATE AI RESPONSE
// ==========================================

export const sendMessage = async (req, res) => {

    // Keep track of messages for error cleanup
    let userMessage = null;
    let aiMessage = null;

    try {
        const { chatId, message } = req.body;
        const userId = req.user.userId;

        // Validate incoming data
        if (
            !chatId ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Chat ID and message are required"
            });
        }

        // Verify chat ownership
        const chat = await chatModel.findOne({
            _id: chatId,
            user: userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Save user message in MongoDB
        userMessage = await messageModel.create({
            chat: chatId,
            role: "user",
            content: message.trim()
        });

        // Fetch complete conversation history
        const chatHistory = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 });

        // Convert messages into conversation format
        const conversation = chatHistory.map((msg) => {

            if (msg.role === "user") {
                return `User: ${msg.content}`;
            }

            return `AI: ${msg.content}`;

        }).join("\n");

        // Measure Gemini API response time
        const startTime = Date.now();

        try {
            // Generate AI response using Gemini
            const aiResponse = await generateAIResponse(conversation);

            console.log(
                "Gemini API Time:",
                ((Date.now() - startTime) / 1000).toFixed(2),
                "seconds"
            );

            // Save AI response in MongoDB
            aiMessage = await messageModel.create({
                chat: chatId,
                role: "ai",
                content: typeof aiResponse === "string"
                    ? aiResponse
                    : JSON.stringify(aiResponse)
            });

        } catch (error) {
            console.error("Gemini API Error:", error.message);
            throw error;
        }

        // Update chat activity time
        chat.updatedAt = new Date();
        // Generate chat title from the first user message
if (chat.title === "New Chat") {
    const words = message.trim().split(/\s+/);

    let generatedTitle = words.slice(0, 6).join(" ");

    if (generatedTitle.length > 40) {
        generatedTitle = generatedTitle.substring(0, 40) + "...";
    }

    chat.title = generatedTitle;
}
        await chat.save();

        // Return successful response
        return res.status(200).json({
            success: true,
            message: "AI response generated successfully",
            messages: {
                userMessage,
                aiMessage,
                chatTitle: chat.title
            }
        });

    } catch (error) {

        console.error("Send Message Error:", error.message);

        // Cleanup incomplete messages if request fails
        try {
            const messagesToDelete = [];

            if (userMessage?._id) {
                messagesToDelete.push(userMessage._id);
            }

            if (aiMessage?._id) {
                messagesToDelete.push(aiMessage._id);
            }

            if (messagesToDelete.length > 0) {
                await messageModel.deleteMany({
                    _id: { $in: messagesToDelete }
                });
            }

        } catch (cleanupError) {
            console.error(
                "Message Cleanup Error:",
                cleanupError.message
            );
        }

        // Identify Gemini quota errors
        const errorMessage = String(error.message || error);

        if (
            errorMessage.includes("429") ||
            errorMessage.toLowerCase().includes("quota")
        ) {
            return res.status(429).json({
                success: false,
                message: "Gemini API daily quota exceeded. Please try again later."
            });
        }

        // Handle other server errors
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI response"
        });
    }
};
