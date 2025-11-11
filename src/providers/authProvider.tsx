"use client";
import { UserDetail } from "@/common/store/appSlices";
import { useRouter, redirect } from "next/navigation";
import { useSelector } from "react-redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const userDetails: UserDetail = useSelector((state: any) => state.userDetail);
  if (userDetails?.oidc_user?.access_token === "") {
    redirect("/");
  }
  return <>{children}</>;
}
