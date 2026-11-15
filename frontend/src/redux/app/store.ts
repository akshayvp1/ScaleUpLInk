import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import reducers
import { persistedAuthReducer } from "../features/auth/authSlice";
import tempSliceReducer from "../features/auth/tempSlice";

// Import chat reducers
import chatReducer from "../features/chat/chatSlice";
import groupReducer from "../features/chat/groupSlice";

// Persist config for temp user
const tempPersistConfig = {
  key: "tempUser",
  storage,
  whitelist: ["tempUser"],
};

// Wrap reducers
const persistedTempReducer = persistReducer(
  tempPersistConfig,
  tempSliceReducer
);

// const persistedPostReducer = persistReducer(postPersistConfig, postReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tempUser: persistedTempReducer,

    // Chat reducers
    chat: chatReducer,
    group: groupReducer,

    // posts: persistedPostReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);