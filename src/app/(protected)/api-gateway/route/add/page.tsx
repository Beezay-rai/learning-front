"use client";

import React from "react";
import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { routes } from "@/app/routes.generated";
import { RouteRequest } from "@/services/apiServices/api-gateway/interfaces/route"; // You’ll define this interface
import RouteForm from "../RouteForm";
export default function AddRoutePage() {
  const router = useRouter();

  const { mutateAsync, isPending: isSubmitting } = apiService.useAddRoute();

  const onSubmit = async (data: RouteRequest) => {
    try {
      await mutateAsync(data, {
        onSuccess: () => {
          toast.success("Route created successfully!");
          router.push(routes["(protected)"]["api-gateway"].route.index);
        },
      });
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to create route");
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Route
      </Typography>

      <RouteForm onSubmit={onSubmit}></RouteForm>
    </Paper>
  );
}
