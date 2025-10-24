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
import { apiService } from "@/api/api-gateway/apiService";
import { Minus, Plus } from "lucide-react";
import { ClusterRequest } from "@/api/api-gateway/interfaces/cluster";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import ClusterForm from "../ClusterForm";

const schema = yup.object({
  name: yup
    .string()
    .required("Cluster name is required")
    .max(50, "Cluster name must be at most 50 characters"),
  destinationAddress: yup
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

export default function AddCluster() {
  const router = useRouter();
  const { control, handleSubmit, formState, reset } = useForm<ClusterRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      clusterDestination: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "destinationAddress",
  });

  const {
    mutateAsync,
    isPending: isSubmitting,
    isSuccess,
  } = apiService.useAddCluster();
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
      {/* <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <Grid container spacing={2}>
          <Grid size={5}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cluster Name"
                  error={!!formState.errors.name}
                  helperText={formState.errors.name?.message}
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                />
              )}
            />
          </Grid>
          <Grid size={2}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<Plus />}
              onClick={() => append({ name: "", destinationAddress: "" })}
            >
              Add Entry
            </Button>
          </Grid>
        </Grid>

        {fields.map((field, index) => (
          <Grid container key={field.id} spacing={2} alignItems="center">
            <Grid size={4}>
              <Controller
                name={`destinationAddress.${index}.name`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    error={!!formState.errors.destinationAddress?.[index]?.name}
                    helperText={
                      formState.errors.destinationAddress?.[index]?.name
                        ?.message
                    }
                    fullWidth
                    inputProps={{ maxLength: 30 }}
                  />
                )}
              />
            </Grid>
            <Grid size={7}>
              <Controller
                name={`destinationAddress.${index}.destinationAddress`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    error={
                      !!formState.errors.destinationAddress?.[index]
                        ?.destinationAddress
                    }
                    helperText={
                      formState.errors.destinationAddress?.[index]
                        ?.destinationAddress?.message
                    }
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={1}>
              <IconButton color="error" onClick={() => remove(index)}>
                <Minus />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? "Adding..." : "Add Cluster"}
          </Button>

          <Link href={routes["(protected)"]["api-gateway"].cluster.index}>
            <Button
              type="button"
              variant="outlined"
              color="error"
              disabled={isSubmitting}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
          </Link>
        </Box>
      </Box> */}
    </Paper>
  );
}
