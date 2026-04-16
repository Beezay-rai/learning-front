"use client";

import { useAuth } from "@/lib/auth/useAuth";
import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h2" color="error" fontWeight={600}>
        404
      </Typography>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Oops! Page not found.
      </Typography>

      <Typography color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        The page you’re looking for doesn’t exist or may have been moved.
      </Typography>

      <Link href={isAuthenticated ? "/dashboard" : "/"} passHref>
        <Button variant="contained" color="primary">
          Go Back Home
        </Button>
      </Link>
    </Box>
  );
}
