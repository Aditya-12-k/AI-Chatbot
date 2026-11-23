import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "./redux/authSlice";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { connectSocket,disconnectSocket } from "./services/socket.service";
import api from "./services/api";
import { setUser, setLoading } from "./redux/authSlice";
import Chat from "./pages/Chat";
// Temporary Home Page
function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogout = async ()=>{
    try{
      await api.post("/auth/logout");
      dispatch(clearUser())
      navigate("/login")
    }
    catch(error){
      console.log("Logout Error:",error.response?.data?.message || error.message);
    }
  }
    return (
        <div>
            <h1>AI Chatbot Home</h1>
            <p>You are successfully authenticated!</p>
       <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

function App() {

    const dispatch = useDispatch();

    // Restore authentication when application starts
    useEffect(() => {

        const checkAuth = async () => {
            try {
                dispatch(setLoading(true));

                const response = await api.get("/auth/get-me");

                dispatch(setUser(response.data.user));

                console.log("Authenticated User:", response.data.user);

            } catch (error) {
                console.log("User is not authenticated");
            } finally {
                dispatch(setLoading(false));
            }
        };

        checkAuth();

    }, [dispatch]);
    const isAuthenticated = useSelector(
      (state)=>state.auth.isAuthenticated
    );
    useEffect(()=>{
      if(isAuthenticated){
        connectSocket();
        console.log("Socket connected")
      }else{
        disconnectSocket();
        console.log("Socket deisconnected")
      }
      return ()=>{
        disconnectSocket()
      };
    },[isAuthenticated])
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <Chat/>
                    </ProtectedRoute>
                }
                ></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;