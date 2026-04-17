"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Paper,
  Typography,
  IconButton,
  Grid,
  Menu,
  Select,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import { RouteRequest } from "@/services/apiServices/api-gateway/interfaces/route"; // You’ll define this interface
import { SearchableSelect } from "@/components/molecules/SearchableSelect";
import NotFound from "@/app/(protected)/not-found";
import RouteForm from "../../RouteForm";
import useApiGatewayService from "@/services/apiServices/api-gateway/useApiGatewayService";

const schema = yup.object({
  name: yup.string().required("Name is Required"),
  clusterId: yup.string().required("Cluster ID is required"),
  path: yup.string().required("Path is required"),
  methods: yup
    .array()
    .of(yup.string().defined())
    .min(1, "At least one method is required")
    .required("Select at least one method"),
});

const methodOptions = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export default function EditRoutePage() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? Number(idParam) : 0;

  const { useGetRouteById, useUpdateRoute } = useApiGatewayService();

  const { data: route, isLoading: routeLoading } = useGetRouteById(id, {
    enabled: !!id && id > 0,
  });

  const { mutateAsync, isPending: isSubmitting } = useUpdateRoute();

  const onSubmit = async (data: RouteRequest) => {
    try {
      await mutateAsync(
        {
          routeId: id,
          payload: data,
        },
        {
          onSuccess: () => {
            toast.success("Route Updated successfully!");
            router.push(routes["(protected)"]["api-gateway"].route.index);
          },
        },
      );
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to Update route");
    }
  };
  if (routeLoading) {
    return <CircularProgress size={24} />;
  }
  if (route === undefined && !routeLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography sx={{ my: 3 }} variant="h5">
        Update Route
      </Typography>

      <RouteForm
        isAdd={false}
        onSubmit={onSubmit}
        loading={isSubmitting}
        defaultValue={route?.data}
      ></RouteForm>
    </Paper>
  );
}
