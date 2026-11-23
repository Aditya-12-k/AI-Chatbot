import { useSelector } from "react-redux";
import { Navigate, replace } from "react-router-dom";
function ProtectedRoute({children}){
    const {isAuthenticated,isLoading} = useSelector(
        (state)=>state.auth
    );
    if(isLoading){
        return <h2>Checking Authentication...</h2>
    }
    if(!isAuthenticated){
        return <Navigate to="/login" replace/>
    }
    return children
}
export default ProtectedRoute