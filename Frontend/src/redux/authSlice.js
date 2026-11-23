import { createSlice } from "@reduxjs/toolkit";

// Initial authentication state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true
};

// Create authentication slice
const authSlice = createSlice({

    name: "auth",

    initialState,

    reducers: {

        // Store logged-in user details
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },

        // Clear authentication data during logout
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },

        // Manage loading state
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }

    }

});

// Export actions
export const {
    setUser,
    clearUser,
    setLoading
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;