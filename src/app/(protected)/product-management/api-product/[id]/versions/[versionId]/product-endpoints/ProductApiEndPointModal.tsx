"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { FormProvider, Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import FormTextField from "@/components/molecules/FormTextField";
import useOrchestratorApiService, {
  ProductApiEndpoint,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import FormSelect from "@/components/molecules/FormSelect";
import { constantsToSelectOptions } from "@/common/helpers/formHelper";
import { APP_RUNTIME_EXECUTOR } from "@/common/constants/APP_RUNTIME_EXECUTOR";
import useApiGatewayService from "@/services/apiServices/api-gateway/useApiGatewayService";

/* =======================
   Schema
======================= */
const productApiEndpointSchema = yup.object({
  name: yup.string().required("Name is required").max(50),
  apiPath: yup.string().required("API Path is required").max(200),
  runTimeExecutioner: yup.string().required("Runtime Executor is required"),
  description: yup.string().required("Description is required").max(200),
  executionerId: yup.string().required("Executioner ID is required"),
  isEnabled: yup.boolean().required(),
});

/* =======================
   Types
======================= */
export interface ProductApiEndpointFormValues {
  name: string;
  apiPath: string;
  runTimeExecutioner: string;
  description: string;
  executionerId: string;
  isEnabled: boolean;
}

interface Props {
  open: boolean;
  productId: number;
  versionId: number;
  defaultValue?: ProductApiEndpoint | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* =======================
   Component
======================= */
export default function ProductApiEndpointModal({
  open,
  productId,
  versionId,
  defaultValue,
  onClose,
  onSuccess,
}: Props) {
  const isEditMode = !!defaultValue;

  const formMethods = useForm<ProductApiEndpointFormValues>({
    resolver: yupResolver(productApiEndpointSchema),
    defaultValues: {
      name: "",
      apiPath: "",
      runTimeExecutioner: "",
      description: "",
      executionerId: "",
      isEnabled: true,
    },
  });

  const { reset, handleSubmit, control, watch } = formMethods;

  const { useAddProductApiEndpoint, useUpdateProductApiEndpoint } =
    useOrchestratorApiService();

  const { mutateAsync: createEndpoint, isPending: creating } =
    useAddProductApiEndpoint();

  const { mutateAsync: updateEndpoint, isPending: updating } =
    useUpdateProductApiEndpoint();

  /* =======================
     Populate form on edit
  ======================= */
  useEffect(() => {
    if (defaultValue) {
      reset({
        name: defaultValue.name,
        apiPath: defaultValue.apiPath,
        runTimeExecutioner: defaultValue.runTimeExecutioner,
        description: defaultValue.description,
        executionerId: defaultValue.executionerId,
        isEnabled: defaultValue.isEnabled,
      });
    } else {
      reset({
        name: "",
        apiPath: "",
        runTimeExecutioner: "",
        description: "",
        isEnabled: true,
        executionerId: "",
      });
    }
  }, [defaultValue, reset]);

  const onSubmit = async (data: ProductApiEndpointFormValues) => {
    try {
      const finalPayload = {
        ...data,
      };

      if (isEditMode && defaultValue) {
        await updateEndpoint({
          id: defaultValue.id,
          productId,
          versionId,
          payload: finalPayload,
        });
        toast.success("Endpoint updated");
      } else {
        await createEndpoint({
          productId,
          versionId,
          payload: finalPayload,
        });
        toast.success("Endpoint created");
      }

      onSuccess();
      onClose();
    } catch {

    }
  };

  const runTimeExecutioner = watch("runTimeExecutioner");
  const { useGetRoutes, useGetClusters } = useApiGatewayService();
  const { data: routes } = useGetRoutes({
    page: 1,
    pageSize: 100,
  },
    {
      enabled: !!runTimeExecutioner,
    }
  )



  const executionerOptions = useMemo(() => {
    if (!runTimeExecutioner) return [];
    if (runTimeExecutioner === APP_RUNTIME_EXECUTOR.API_GATEWAY) {
      return routes?.data?.items.map((route) => ({
        label: route.name,
        value: route.id,
      })) ?? [];
    }
    return [
      { label: "Executioner 1", value: "1" },
      { label: "Executioner 2", value: "2" },
    ]
  }, [runTimeExecutioner, routes]);


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Edit Endpoint" : "Add Endpoint"}</DialogTitle>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField fullWidth label="Name" name="name" />
              </Grid>



              <Grid size={{ xs: 12, sm: 12 }}>
                <FormTextField fullWidth label="API Path" name="apiPath" />
              </Grid>

              <Grid size={{ xs: 12, sm: 12 }}>
                <FormSelect
                  size="small"
                  label="Runtime Executor"
                  name="runTimeExecutioner"
                  options={constantsToSelectOptions(APP_RUNTIME_EXECUTOR)}
                ></FormSelect>
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
                <FormSelect
                  size="small"
                  label="Executioner"
                  name="executionerId"
                  disabled={!runTimeExecutioner}
                  options={executionerOptions}
                ></FormSelect>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  fullWidth
                  label="Description"
                  name="description"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="isEnabled"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Enabled"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={creating || updating}
            >
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
