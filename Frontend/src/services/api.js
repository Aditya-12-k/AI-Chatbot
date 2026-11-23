import axios from "axios"
const api = axios.create({
    // backend url 
    baseURL:"http://localhost:8000/api",
    withCredentials:true,
    headers:{
        "Content-Type":"application/json"
    }
});
export default api;