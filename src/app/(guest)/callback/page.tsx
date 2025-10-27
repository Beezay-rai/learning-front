"use client";

import { useEffect, useRef } from "react";
import { signinCallback } from "@/services/authService";
import { useDispatch } from "react-redux";
import { setOIDCUser, updateToken } from "@/common/store/appSlices";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await signinCallback();
        router.push("/dashboard");
        dispatch(
          setOIDCUser({
            access_token: user.access_token,
          })
        );
      } catch (err) {
        console.error("Error during signin callback:", err);
      }
    };
    fetchData();
  }, []);

  return <div>Completing login…</div>;
}
