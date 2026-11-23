import dns from "dns"
dns.setServers(['8.8.8.8'])
import dotenv from "dotenv";

dotenv.config()
import initalizeSocket from "./src/sockets/server.socket.js";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import http from "http";
const server = http.createServer(app)
// Create HTTP server using Express app
const io = initalizeSocket(server)

const PORT = process.env.PORT || 8000

const startServer = async ()=>{
    try{
        await connectDB()
        server.listen(PORT,()=>{
            console.log(`server is running on port ${PORT}`)
        })
    }catch(error){
        console.error("Server startup failed:",error.message)
    }
}
startServer()