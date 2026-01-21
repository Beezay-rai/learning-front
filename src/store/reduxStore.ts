import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { userSlice } from "./appSlices";
import { persistReducer, persistStore } from "redux-persist";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist/es/constants";

const persistConfig = {
  key: "storeToolkit",
  version: 1,
  storage,
};

const reducer = combineReducers({
  userDetail: userSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const reduxStore = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export type RootState = ReturnType<typeof reduxStore.getState>;

export const persistor = persistStore(reduxStore);
