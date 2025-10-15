"use client";
import AuthProvider from "@/providers/authProvider";
import MyQueryClientProvider from "@/providers/queryClientProvider";
import { ReduxProvider } from "@/providers/reduxProvider";
import React from "react";

export default function RootProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyQueryClientProvider>
      <AuthProvider>
        <ReduxProvider>{children}</ReduxProvider>
      </AuthProvider>
    </MyQueryClientProvider>
  );
}
