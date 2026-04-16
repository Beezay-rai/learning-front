"use client";

import { Box, Button, Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";

import FormTextField from "@/components/molecules/FormTextField";
import { routes } from "@/app/routes.generated";

const apiProductSchema = yup.object({
  name: yup.string().required("Name is required").max(50, "Max 50 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Max 200 characters"),
});

export interface ApiProductRequest {
  name: string;
  description: string;
}

interface ApiProductFormProps {
  onSubmit: (data: ApiProductRequest) => void;
  loading?: boolean;
  defaultValue?: ApiProductRequest;
  isAdd?: boolean;
}

export default function ApiProductForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
}: ApiProductFormProps) {
  const formMethods = useForm<ApiProductRequest>({
    resolver: yupResolver(apiProductSchema),
    defaultValues: defaultValue,
  });

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid size={4}>
            <FormTextField fullWidth label="Name" name="name" />
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
                ? "Add Product"
                : "Update"}
          </Button>

          <Link href={routes["(protected)"]["product-management"]["api-product"].index}>
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
