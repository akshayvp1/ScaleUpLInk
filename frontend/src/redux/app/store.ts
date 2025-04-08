



// // store.ts
// import { configureStore } from "@reduxjs/toolkit";
// import {
//   persistStore,
//   persistReducer,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";
// import storage from "redux-persist/lib/storage"; // Add this import
// import { persistedAuthReducer } from "../features/auth/authSlice";
// import tempSliceReducer from "../features/auth/tempSlice";

// // Create persist config for tempSlice
// const tempPersistConfig = {
//   key: "tempUser",
//   storage,
//   whitelist: ["tempUser"], // Specify which parts to persist
// };

// // Wrap tempSlice reducer with persistReducer
// const persistedTempReducer = persistReducer(tempPersistConfig, tempSliceReducer);

// export const store = configureStore({
//   reducer: {
//     auth: persistedAuthReducer,
//     tempUser: persistedTempReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export const persistor = persistStore(store);





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


// Create persist config for tempSlice
const tempPersistConfig = {
  key: "tempUser",
  storage,
  whitelist: ["tempUser"], // Specify which parts to persist
};

// Create persist config for posts (optional, uncomment if you want to persist posts)
const postPersistConfig = {
  key: "posts",
  storage,
  whitelist: ['posts', 'currentPost'], // Specify which parts of post state to persist
};

// Wrap reducers with persistReducer
const persistedTempReducer = persistReducer(tempPersistConfig, tempSliceReducer);
// const persistedPostReducer = persistReducer(postPersistConfig, postReducer); // Optional persistence for posts

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tempUser: persistedTempReducer,
    // posts: persistedPostReducer, // Add posts reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);