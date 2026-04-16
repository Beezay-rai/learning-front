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
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import { RouteRequest } from "@/services/apiServices/api-gateway/interfaces/Route"; // You’ll define this interface
import { SearchableSelect } from "@/components/molecules/SearchableSelect";
import NotFound from "@/app/(protected)/not-found";
import RestBuilderForm from "../../RestBuilderForm";
import { RestApiBuilderRequest } from "@/services/apiServices/core/interface/RestApiBuilderModel";
import useCoreApiService from "@/services/apiServices/core/useCoreApiService";

export default function EditRoutePage() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const { useGetRestApiBuilderById, useUpdateRestApiBuilder } =
    useCoreApiService();
  const id = idParam ? Number(idParam) : 0;

  const { data: restApiBuilder, isLoading: restApiBuilderLoading } =
    useGetRestApiBuilderById(id, {
      enabled: id > 0,
    });

  const { mutateAsync, isPending: isSubmitting } = useUpdateRestApiBuilder();

  const onSubmit = async (data: RestApiBuilderRequest) => {
    try {
      await mutateAsync(
        {
          id: id,
          payload: data,
        },
        {
          onSuccess: () => {
            toast.success("Route Updated successfully!");
            router.push(routes["(protected)"].proxy["rest-builder"].index);
          },
        }
      );
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to Update route");
    }
  };

  if (restApiBuilder === undefined && !restApiBuilderLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography sx={{ mb: 3 }} variant="h5">
        Update Api
      </Typography>

      {restApiBuilderLoading ? (
        <CircularProgress color="inherit" />
      ) : (
        <RestBuilderForm
          isAdd={false}
          onSubmit={onSubmit}
          loading={isSubmitting}
          defaultValue={restApiBuilder?.data}
        ></RestBuilderForm>
      )}
    </Paper>
  );
}
