import {io} from "socket.io-client";
const SOCKET_URL = "http://localhost:8000";

export const socket  = io(SOCKET_URL,{
    autoConnect:false,
    withCredentials:true
});
// connect socket 
export const connectSocket  = ()=>{
    if(!socket.connected){
        socket.connect()
    }
};
export const disconnectSocket = ()=>{
    if(socket.connected){
        socket.disconnect();
    }
};