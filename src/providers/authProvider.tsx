"use client";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = useSelector((state) => state.userDetail);

  return children;
}
