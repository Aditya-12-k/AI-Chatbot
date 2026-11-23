import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
 // configure redux store
const store = configureStore({
    reducer:{
        auth:authReducer
    }
});
export default store