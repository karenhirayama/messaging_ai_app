import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
    email: string;
    sub: string; 
    nickname: string;
    iat?: number; 
    exp?: number;
}

const loadUserFromStorage = (): UserPayload | null => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        try {
            const decodedUser = jwtDecode(token) as UserPayload;
            
            const currentTime = Date.now() / 1000;
            if (decodedUser.exp && decodedUser.exp < currentTime) {
                localStorage.removeItem("accessToken");
                return null;
            }
            
            return decodedUser;
        } catch (e) {
            console.error("Failed to decode token from storage on startup:", e);
            localStorage.removeItem("accessToken"); 
            return null;
        }
    }
    return null;
}

const initialUser = loadUserFromStorage();
const initialToken = localStorage.getItem("accessToken");

const initialState = {
  accessToken: initialToken,
  isAuthenticated: !!initialToken,
  user: initialUser, 
};

const authSlice = createSlice({
  name: "auth",
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