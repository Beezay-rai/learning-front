"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

// ✅ Yup schema for signup
const signupSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

type SignupFormInputs = yup.InferType<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormInputs) => {

    // Example: redirect after signup
    if (data.email && data.password) {
      router.push("/login");
    } else {
      setError("Something went wrong");
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
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, py: 1.2 }}
            >
              Sign Up
            </Button>
          </form>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            mt={3}
          >
            Already have an account? <a href="/login">Login</a>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
