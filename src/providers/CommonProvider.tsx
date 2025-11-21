import React from "react";
import ConfirmProvider from "./ConfirmProvider";

export default function CommonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConfirmProvider>{children}</ConfirmProvider>
    </>
  );
}
