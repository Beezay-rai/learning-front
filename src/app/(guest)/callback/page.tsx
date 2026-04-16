"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { CircularProgress, Box, Typography } from "@mui/material";
import { signinCallback } from "@/services/authService";
import { setOIDCUser } from "@/store/appSlices";
import { useAuth } from "@/lib/auth/useAuth";
import { User } from "oidc-client-ts";

export default function CallbackPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const mapUser = (user: User) => ({
    access_token: user.access_token,
    id_token: user.id_token,
    expires_at: user.expires_at,
    profile: user.profile,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await signinCallback();
        dispatch(setOIDCUser(mapUser(user)));
        router.push("/dashboard");
      } catch (err) {
        // console.error("Error during signin callback:", err);
      }
    };

    fetchData();
  }, [dispatch, router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="h6">Completing login…</Typography>
    </Box>
  );
}
