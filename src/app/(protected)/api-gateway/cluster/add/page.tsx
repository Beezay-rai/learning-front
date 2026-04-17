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
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Minus, Plus } from "lucide-react";
import { ClusterRequest } from "@/services/apiServices/api-gateway/interfaces/cluster";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import ClusterForm from "@/app/(protected)/api-gateway/cluster/ClusterForm";
import useApiGatewayService from "@/services/apiServices/api-gateway/useApiGatewayService";

const schema = yup.object({
  name: yup
    .string()
    .required("Cluster name is required")
    .max(50, "Cluster name must be at most 50 characters"),
  clusterDestination: yup
    .array()
    .of(
      yup.object({
        name: yup
          .string()
          .required("Destination name is required")
          .max(30, "Destination name must be at most 30 characters"),
        destinationAddress: yup
          .string()
          .required("Destination address is required"),
        // .url(
        //   "Must be a valid URI (e.g., http://example.com or https://example.com)"
        // ),
      }),
    )
    .required("At least one destination is required")
    .min(1, "At least one destination is required"),
});

export default function AddCluster() {
  const router = useRouter();
  const { control, handleSubmit, formState, reset } = useForm<ClusterRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      clusterDestination: [],
    },
  });
  const { useAddCluster } = useApiGatewayService();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "clusterDestination",
  });

  const { mutateAsync, isPending: isSubmitting, isSuccess } = useAddCluster();
  const onSubmit = async (data: ClusterRequest) => {
    try {
      await mutateAsync(data, {
        onSuccess: () => {
          toast.success("Cluster Created Sucessfully !");
          router.push(routes["(protected)"]["api-gateway"].cluster.index);
        },
      });
    } catch (err) {
      console.error("Failed to add cluster:", err);
    }
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Cluster
      </Typography>
      <ClusterForm onSubmit={onSubmit} loading={isSubmitting}></ClusterForm>
    </Paper>
  );
}
