import authRoutes from "./routes/auth.routes.js"
import chatRoutes from "./routes/chat.routes.js";
// import express framework
import express from "express"

import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"

const app = express()
app.use(cookieParser())
app.use(express.json())

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({extended:true}));

app.use(morgan("dev"))

// Allow requests from React frontend
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use("/api/chats", chatRoutes);
app.use("/api/auth",authRoutes)

app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"AI Chatbot Backend is running!"
    })
})

export default app;