"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    // .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginFormInputs = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    const { email, password } = data;

    if (email === "admin@example.com" && password === "123456") {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card sx={{ width: 400, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h1"
            textAlign="center"
            fontWeight={600}
            mb={3}
          >
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.2 }}
            >
              Sign In
            </Button>
          </form>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={3}
          >
            Don’t have an account? <a href="/signup">Sign up</a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
