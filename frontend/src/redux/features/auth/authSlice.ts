




import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { AuthState, IUser, UserRole } from "../../../types/auth/auth.types";

const initialState: AuthState = {
  name: null,
  user: null,
  email: "",
  role: null,
  token: null,
  isAuthenticated: false,
  profession: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    signIn: (
      state,
      action: PayloadAction<{
        email: string;
        role: UserRole;
        token: string;
        isAuthenticated?: boolean;
        user?: IUser;
      }>
    ) => {
      const { email, role, token, isAuthenticated, user } = action.payload;
      state.isAuthenticated = isAuthenticated ?? true;
      state.email = email;
      state.role = role;
      state.token = token;
      
      // If user is provided, use it; otherwise create a new user object
      state.user = user || {
        email: email,
        role: role,
        token: token,
        name: state.name || null, // Use the state's name or null if not provided
      };
    },
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      if (state.user) {
        state.user.token = action.payload.token;
      }
    },
    setAuthenticate: (state) => {
      state.isAuthenticated = true;
    },
    signOut: () => initialState,
  },
});

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "email", "role", "token", "isAuthenticated"],
};

export const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

export const { signIn, setToken, setAuthenticate, signOut } = authSlice.actions;