"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { CircularProgress, Box, Typography } from "@mui/material";
import { signinCallback } from "@/services/authService";
import { setOIDCUser } from "@/common/store/appSlices";

export default function CallbackPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await signinCallback();
        dispatch(setOIDCUser(user));
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
