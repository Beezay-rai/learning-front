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
import { apiService } from "@/api/api-gateway/apiService";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import { RouteRequest } from "@/api/api-gateway/interfaces/route"; // You’ll define this interface
import { SearchableSelect } from "@/components/molecules/SearchableSelect";
import RouteForm from "../RouteForm";

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

  const { data: route, isLoading: routeLoading } = apiService.useGetRouteById(
    id,
    {
      enabled: !!id,
    }
  );

  const { control, handleSubmit, formState, reset } = useForm<RouteRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      clusterId: "",
      path: "",
      methods: [],
    },
  });

  const { data: clusters } = apiService.useGetClusters();
  const clusterOptions = clusters?.items.map((item, index) => {
    return {
      label: item.name,
      value: item.id,
    };
  });

  const { mutateAsync, isPending: isSubmitting } = apiService.useUpdateRoute();

  const onSubmit = async (data: RouteRequest) => {
    try {
      await mutateAsync(data, {
        onSuccess: () => {
          toast.success("Route Updated successfully!");
          router.push(routes["(protected)"]["api-gateway"].route.index);
        },
      });
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to Update route");
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography sx={{ my: 3 }} variant="h5">
        Update Route
      </Typography>

      {routeLoading ? (
        <CircularProgress color="inherit" />
      ) : (
        <RouteForm
          isAdd={false}
          onSubmit={onSubmit}
          loading={routeLoading}
          defaultValue={route}
        ></RouteForm>
      )}
    </Paper>
  );
}
