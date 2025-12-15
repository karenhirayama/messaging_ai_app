// src/features/auth/authSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';

// Define the specific user payload type (matching your NestJS JWT content)
interface UserPayload {
    email: string;
    sub: string; // The User ID (Subject)
    nickname: string;
    iat?: number; // Issued At (Optional)
    exp?: number; // Expiration Time (Optional)
}

// ⭐️ HYDRATION FIX: Helper function to load and decode user from storage ⭐️
const loadUserFromStorage = (): UserPayload | null => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        try {
            const decodedUser = jwtDecode(token) as UserPayload;
            
            // Optional: Check token expiration on startup
            const currentTime = Date.now() / 1000;
            if (decodedUser.exp && decodedUser.exp < currentTime) {
                // Token expired, clear it and return null
                localStorage.removeItem("accessToken");
                return null;
            }
            
            return decodedUser;
        } catch (e) {
            console.error("Failed to decode token from storage on startup:", e);
            localStorage.removeItem("accessToken"); // Clear bad token
            return null;
        }
    }
    return null;
}

// 1. Calculate the initial state values using the helper function
const initialUser = loadUserFromStorage();
const initialToken = localStorage.getItem("accessToken");

const initialState = {
  accessToken: initialToken,
  // isAuthenticated relies on the token existing
  isAuthenticated: !!initialToken,
  user: initialUser, // ⭐️ Initialize user state with the decoded token ⭐️
};

const authSlice = createSlice({
  name: "auth",
  // 2. Use the calculated initial state
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ access_token: string }>) => {
      const { access_token } = action.payload;
      state.accessToken = access_token;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", access_token);
      
      try {
        const decodedUser = jwtDecode(access_token) as UserPayload;
        state.user = decodedUser; 
                
      } catch (e) {
        console.error("Failed to decode token on login:", e);
        state.user = null;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;