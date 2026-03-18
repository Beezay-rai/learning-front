"use client";

import React from "react";
import { Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { routes } from "@/app/routes.generated";
import { RouteRequest } from "@/services/apiServices/api-gateway/interfaces/Route"; // You’ll define this interface
import RouteForm from "../RouteForm";
import useApiGatewayService from "@/services/apiServices/api-gateway/useApiGatewayService";
export default function AddRoutePage() {
  const router = useRouter();

  const { useAddRoute } = useApiGatewayService()
  const { mutateAsync, isPending: isSubmitting } = useAddRoute();

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

      <RouteForm onSubmit={onSubmit} loading={isSubmitting}></RouteForm>
    </Paper>
  );
}
