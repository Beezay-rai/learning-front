"use client";
import { persistor, store } from "@/common/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>{children}</PersistGate>{" "}
    </Provider>
  );
}
