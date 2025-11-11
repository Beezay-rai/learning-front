import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { RouteRequest } from "@/services/apiServices/api-gateway/interfaces/route";
import { routes } from "@/app/routes.generated";
import { SearchableSelect } from "@/components/molecules/SearchableSelect";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

const methodOptions = ["GET", "POST", "PUT", "DELETE", "PATCH"];

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

interface RouteFormProps {
  onSubmit: (data: RouteRequest) => void;
  loading?: boolean;
  defaultValue?: RouteRequest;
  isAdd?: boolean;
}

export default function RouteForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
}: RouteFormProps) {
  const { control, handleSubmit, formState, reset } = useForm<RouteRequest>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(defaultValue ?? {
        name: "",
        clusterId: "",
        path: "",
      }),
      methods: defaultValue?.methods || [],
    },
  });

  const { data: clusters } = apiService.useGetClusters();
  const clusterOptions = clusters?.items.map((item, index) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  useEffect(() => {
    if (defaultValue) {
      reset({
        ...defaultValue,
        methods: defaultValue.methods || [],
      });
    }
  }, [defaultValue, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={3}>
        <Grid size={4}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                error={!!formState.errors.name}
                helperText={formState.errors.name?.message}
              />
            )}
          />
        </Grid>
        <Grid size={4}>
          <SearchableSelect
            label="Cluster Id"
            name="clusterId"
            control={control}
            options={clusterOptions || []}
          ></SearchableSelect>
        </Grid>

        <Grid size={4}>
          <Controller
            name="methods"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!formState.errors.methods}>
                <InputLabel>HTTP Methods</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="HTTP Methods" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((method) => (
                        <Chip key={method} label={method} />
                      ))}
                    </Box>
                  )}
                >
                  {methodOptions.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
                {formState.errors.methods && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ ml: 2, mt: 0.5 }}
                  >
                    {formState.errors.methods.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12}>
          <Controller
            name="path"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Path"
                fullWidth
                error={!!formState.errors.path}
                helperText={
                  <>
                    {formState.errors.path?.message}
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#6b6b6b",
                      }}
                    >
                      Path should begin with <code>/</code> and can use{" "}
                      <code>{`/{**catchall}`}</code> for wildcard
                    </span>
                  </>
                }
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color={isAdd ? "primary" : "warning"}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading
            ? isAdd
              ? "Adding..."
              : "Updating..."
            : isAdd
            ? "Add Route"
            : "Update"}
        </Button>

        <Link href={routes["(protected)"]["api-gateway"].route.index}>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
