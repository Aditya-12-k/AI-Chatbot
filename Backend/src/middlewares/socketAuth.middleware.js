import jwt from "jsonwebtoken"
import * as cookie from "cookie"
const socketAuthMiddleware = (socket,next)=>{
    try{
        const cookies = cookie.parse(
            socket.handshake.headers.cookie || ""
        );
        const token = cookies.token
        if(!token){
            return next(new Error("Authentication required. Please login."));
        }
        const decoded = jwt.verify(
            token,process.env.JWT_SECRET
        );
        socket.user = decoded
        next()
    }catch(error){
        console.error("Socket Authentication Error:",error.message);
        next(new Error("Invalid or expired authentication token."))

    }
}
export default socketAuthMiddleware;