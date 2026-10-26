"use client";

import { Button, Grid, FormControlLabel, Switch } from "@mui/material";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { useParams } from "next/navigation";

import FormTextField from "@/components/molecules/FormTextField";
import { routes } from "@/app/routes.generated";
import { ProductInfoRequest } from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

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
      <FormShell title={isAdd ? "Add Product Info" : "Update Product Info"} description="Add descriptive information and publishing status." component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
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

        <FormActions submitLabel={isAdd ? "Add info" : "Update info"} loading={loading} cancel={<Link href={listHref}><Button type="button" color="inherit" disabled={loading}>Cancel</Button></Link>} />
      </FormShell>
    </FormProvider>
  );
}
