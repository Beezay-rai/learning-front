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
  CircularProgress,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { apiService } from "@/api/api-gateway/apiService";
import { Minus, Plus } from "lucide-react";
import { ClusterRequest } from "@/api/api-gateway/interfaces/cluster";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import ClusterForm from "../ClusterForm";
import NotFound from "@/app/(protected)/not-found";

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
      })
    )
    .required("At least one destination is required")
    .min(1, "At least one destination is required"),
});

export default function UpdateCluster() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? Number(idParam) : 0;

  const { data: cluster, isLoading: clusterLoading } =
    apiService.useGetClusterById(id, {
      enabled: !!id,
    });

  const { mutateAsync, isPending: isSubmitting } =
    apiService.useUpdateCluster();

  const onSubmit = async (data: ClusterRequest) => {
    try {
      await mutateAsync(
        {
          clusterId: id,
          data: data,
        },
        {
          onSuccess: () => {
            toast.success("Cluster Updated Sucessfully !");
            router.push(routes["(protected)"]["api-gateway"].cluster.index);
          },
        }
      );
    } catch (err) {
      console.error("Failed to add cluster:", err);
    }
  };
  if (cluster === undefined) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Update Cluster
      </Typography>
      {clusterLoading ? (
        <CircularProgress color="inherit" />
      ) : (
        <ClusterForm
          isAdd={false}
          onSubmit={onSubmit}
          defaultValue={cluster}
          loading={isSubmitting}
        ></ClusterForm>
      )}
    </Paper>
  );
}
