"use client";
import { persistor, reduxStore } from "@/store/reduxStore";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={reduxStore}>
      <PersistGate persistor={persistor}>{children}</PersistGate>
    </Provider>
  );
}
