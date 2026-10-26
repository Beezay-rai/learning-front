"use client";

import { Button, Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";

import FormTextField from "@/components/molecules/FormTextField";
import { routes } from "@/app/routes.generated";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

const apiProductSchema = yup.object({
  name: yup.string().required("Name is required").max(50, "Max 50 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Max 200 characters"),
  baseAddress: yup.string().required("Base address is required"),
});

export interface ApiProductRequest {
  name: string;
  description: string;
  baseAddress: string;
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
      <FormShell title={isAdd ? "Add API Product" : "Update API Product"} description="Define the public details and base address for this API." component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid size={4}>
            <FormTextField fullWidth label="Name" name="name" />
          </Grid>

          <Grid size={4}>
            <FormTextField fullWidth label="Base Address" name="baseAddress" />
          </Grid>          <Grid size={12}>
            <FormTextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <FormActions submitLabel={isAdd ? "Add product" : "Update product"} loading={loading} cancel={<Link href={routes["(protected)"]["product-management"]["api-product"].index}><Button type="button" color="inherit" disabled={loading}>Cancel</Button></Link>} />
      </FormShell>
    </FormProvider>
  );
}
