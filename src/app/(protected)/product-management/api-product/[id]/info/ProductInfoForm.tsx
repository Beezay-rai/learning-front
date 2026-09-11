"use client";

import { Box, Button, Grid, FormControlLabel, Switch } from "@mui/material";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { useParams } from "next/navigation";

import FormTextField from "@/components/molecules/FormTextField";
import { routes } from "@/app/routes.generated";
import { ProductInfoRequest } from "@/services/apiServices/orchestrator/useOrchestratorApiService";

const productInfoSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .max(100, "Max 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Max 200 characters"),
  isActive: yup.boolean().required(),
});

interface ProductInfoFormProps {
  onSubmit: (data: ProductInfoRequest) => void;
  loading?: boolean;
  defaultValue?: ProductInfoRequest;
  isAdd?: boolean;
}

export default function ProductInfoForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
}: ProductInfoFormProps) {
  const params = useParams();
  const productId = params?.id;

  const formMethods = useForm<ProductInfoRequest>({
    resolver: yupResolver(productInfoSchema),
    defaultValues: defaultValue ?? {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const listHref =
    routes["(protected)"]["product-management"]["api-product"].index +
    productId +
    "/info";

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid size={5}>
            <FormTextField fullWidth label="Name" name="name" />
          </Grid>

          <Grid size={3}>
            <Controller
              name="isActive"
              control={formMethods.control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Active"
                  sx={{ mt: 1 }}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <FormTextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, m: 3 }}>
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
                ? "Add Info"
                : "Update"}
          </Button>

          <Link href={listHref}>
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
      </form>
    </FormProvider>
  );
}
