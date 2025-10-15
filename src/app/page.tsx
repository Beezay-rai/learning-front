"use client";

import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            MyApp
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LogIn />}
            onClick={handleLogin}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
        <Stack spacing={3} alignItems="center">
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Welcome to <span style={{ color: "#1976d2" }}>MyApp</span>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            Build, manage, and grow your projects effortlessly with modern tools
            and seamless collaboration.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1rem",
            }}
            onClick={handleLogin}
          >
            Get Started
          </Button>
        </Stack>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          mt: 12,
          py: 3,
          textAlign: "center",
          bgcolor: "grey.100",
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} MyApp. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
