import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "./Chat.css";

function Chat() {

    const [message, setMessage] = useState("");
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingChats, setIsLoadingChats] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, isSending]);

    // Fetch all chats
    const fetchChats = async () => {
        try {
            setIsLoadingChats(true);

            const response = await api.get("/chats");

            setChats(response.data.chats || []);

        } catch (error) {
            console.log("Fetch Chats Error:", error.response?.data?.message || error.message);
        } finally {
            setIsLoadingChats(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    // Create new chat
    const handleCreateChat = async () => {
        try {
            const response = await api.post("/chats/create", {
                title: "New Chat"
            });

            const newChat = response.data.chat;

            setChats(prev => [
                newChat,
                ...prev
            ]);

            setChatId(newChat._id);
            setMessages([]);
            setMessage("");

            inputRef.current?.focus();

        } catch (error) {
            console.log("Create Chat Error:", error.response?.data?.message || error.message);
        }
    };

    // Select existing chat
    const handleSelectChat = async (selectedChatId) => {
        try {
            setChatId(selectedChatId);
            setMessages([]);
            setMessage("");
            setIsLoadingMessages(true);

            const response = await api.get(
                `/chats/${selectedChatId}/messages`
            );

            setMessages(response.data.messages || []);

        } catch (error) {
            console.log("Fetch Messages Error:", error.response?.data?.message || error.message);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Delete chat
    const handleDeleteChat = async (selectedChatId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this conversation?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/chats/delete/${selectedChatId}`);

            setChats(prev =>
                prev.filter(chat => chat._id !== selectedChatId)
            );

            if (chatId === selectedChatId) {
                setChatId(null);
                setMessages([]);
                setMessage("");
            }

        } catch (error) {
            console.log("Delete Chat Error:", error.response?.data?.message || error.message);
        }
    };

    // Send message
    const handleSendMessage = async (e) => {

        e.preventDefault();

        if (!message.trim() || isSending) return;

        if (!chatId) {
            alert("Please create a new chat first.");
            return;
        }

        try {
            setIsSending(true);

            const response = await api.post("/chats/message", {
                chatId: chatId,
                message: message.trim()
            });

            setMessages(prev => [
                ...prev,
                response.data.messages.userMessage,
                response.data.messages.aiMessage
            ]);

            // Update automatic chat title
            if (response.data.chatTitle) {
                setChats(prev =>
                    prev.map(chat =>
                        chat._id === chatId
                            ? { ...chat, title: response.data.chatTitle }
                            : chat
                    )
                );
            }

            setMessage("");

        } catch (error) {
            console.log("Send Message Error:", error.response?.data?.message || error.message);
        } finally {
            setIsSending(false);
        }
    };

    // Get selected chat title
    const selectedChat = chats.find(
        chat => chat._id === chatId
    );

    return (

        <div className="chat-app">

            {/* SIDEBAR */}

            <aside className="chat-sidebar">

                <div className="sidebar-brand">
                    <div className="sidebar-logo">✦</div>
                    <span>Neura<span>AI</span></span>
                </div>

                <button
                    className="new-chat-btn"
                    onClick={handleCreateChat}
                >
                    <span>＋</span>
                    New Chat
                </button>

                <div className="sidebar-section">

                    <p className="sidebar-heading">
                        YOUR CONVERSATIONS
                    </p>

                    <div className="chat-history-list">

                        {isLoadingChats && (
                            <p className="sidebar-empty">
                                Loading chats...
                            </p>
                        )}

                        {!isLoadingChats && chats.length === 0 && (
                            <p className="sidebar-empty">
                                No conversations yet.
                            </p>
                        )}

                        {chats.map(chat => (

                            <div
                                key={chat._id}
                                className={`history-item ${chatId === chat._id ? "active" : ""}`}
                            >

                                <button
                                    className="history-select"
                                    onClick={() => handleSelectChat(chat._id)}
                                    title={chat.title}
                                >
                                    <span className="history-icon">◈</span>

                                    <span className="history-title">
                                        {chat.title}
                                    </span>
                                </button>

                                <button
                                    className="delete-chat-btn"
                                    onClick={() => handleDeleteChat(chat._id)}
                                    title="Delete conversation"
                                >
                                    ×
                                </button>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="sidebar-bottom">

                    <div className="sidebar-user-icon">
                        AI
                    </div>

                    <div className="sidebar-user-info">
                        <strong>My Workspace</strong>
                        <span>Personal Account</span>
                    </div>

                    <span className="online-indicator"></span>

                </div>

            </aside>


            {/* MAIN CHAT AREA */}

            <main className="chat-main">

                {/* TOP HEADER */}

                <header className="chat-topbar">

                    <div>
                        <span className="topbar-title">
                            AI Assistant
                        </span>

                        <span className="topbar-subtitle">
                            Your intelligent conversation space
                        </span>
                    </div>

                    <div className="ai-status">
                        <span className="status-dot"></span>
                        AI Online
                    </div>

                </header>


                {/* CHAT CONTENT */}

                <section className="chat-content">

                    {!chatId ? (

                        <div className="welcome-screen">

                            <div className="welcome-icon">
                                ✦
                            </div>

                            <span className="welcome-label">
                                YOUR AI ASSISTANT
                            </span>

                            <h1>
                                Hello there!
                                <br />
                                <span>What can I help you with?</span>
                            </h1>

                            <p>
                                Ask questions, explore ideas, write code
                                or discover something new.
                                Your AI assistant is ready.
                            </p>

                            <button
                                className="welcome-button"
                                onClick={handleCreateChat}
                            >
                                ＋ Start a new conversation
                            </button>

                        </div>

                    ) : (

                        <div className="conversation-container">

                            <div className="conversation-heading">
                                <span>◈</span>
                                {selectedChat?.title || "New Conversation"}
                            </div>

                            {isLoadingMessages ? (

                                <div className="loading-messages">
                                    Loading conversation...
                                </div>

                            ) : (

                                <div className="messages-list">

                                    {messages.map((msg, index) => (

                                        <div
                                            key={msg._id || index}
                                            className={`message-row ${msg.role === "user" ? "user-row" : "ai-row"}`}
                                        >

                                            <div className="message-avatar">
                                                {msg.role === "user" ? "U" : "✦"}
                                            </div>

                                            <div className="message-body">

                                                <span className="message-author">
                                                    {msg.role === "user" ? "You" : "NeuraAI"}
                                                </span>

                                                <div className="message-text">
                                                    {msg.content}
                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                    {isSending && (

                                        <div className="message-row ai-row">

                                            <div className="message-avatar">
                                                ✦
                                            </div>

                                            <div className="message-body">

                                                <span className="message-author">
                                                    NeuraAI
                                                </span>

                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>

                                            </div>

                                        </div>

                                    )}

                                    <div ref={messagesEndRef}></div>

                                </div>

                            )}

                        </div>

                    )}

                </section>


                {/* MESSAGE INPUT */}

                <footer className="chat-footer">

                    <form
                        className="message-form"
                        onSubmit={handleSendMessage}
                    >

                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={
                                chatId
                                    ? "Message NeuraAI..."
                                    : "Start a new chat to begin..."
                            }
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={!chatId || isSending}
                        />

                        <button
                            type="submit"
                            disabled={!chatId || !message.trim() || isSending}
                            className="send-button"
                            title="Send message"
                        >
                            ➤
                        </button>

                    </form>

                    <p className="footer-disclaimer">
                        NeuraAI can make mistakes. Verify important information.
                    </p>

                </footer>

            </main>

        </div>

    );
}

export default Chat;