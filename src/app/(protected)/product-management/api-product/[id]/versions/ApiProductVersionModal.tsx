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
import { useEffect } from "react";
import { FormProvider, Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import FormTextField from "@/components/molecules/FormTextField";
import useOrchestratorApiService, {
  ProductVersion,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";

/* =======================
   Schema
======================= */
const apiProductVersionSchema = yup.object({
  enable: yup.boolean().required(),
  version: yup.string().required("Version is required").max(20),
  description: yup.string().required("Description is required").max(200),
});

/* =======================
   Types
======================= */
export interface ApiProductVersionFormValues {
  enable: boolean;
  version: string;
  description: string;
}

interface Props {
  open: boolean;
  productId: number;
  defaultValue?: ProductVersion | null;
  onClose: () => void;
  onSuccess: () => void;
}

/* =======================
   Component
======================= */
export default function ApiProductVersionModal({
  open,
  productId,
  defaultValue,
  onClose,
  onSuccess,
}: Props) {
  const isEditMode = !!defaultValue;

  const formMethods = useForm<ApiProductVersionFormValues>({
    resolver: yupResolver(apiProductVersionSchema),
    defaultValues: {
      enable: true,
      version: "",
      description: "",
    },
  });

  const { reset, handleSubmit, control } = formMethods;

  const { useAddApiProductVersion, useUpdateApiProductVersion } =
    useOrchestratorApiService();

  const { mutateAsync: createVersion, isPending: creating } =
    useAddApiProductVersion();

  const { mutateAsync: updateVersion, isPending: updating } =
    useUpdateApiProductVersion();

  useEffect(() => {
    if (defaultValue) {
      reset({
        enable: defaultValue.enable,
        version: defaultValue.version,
        description: defaultValue.description,
      });
    } else {
      reset({
        enable: true,
        version: "",
        description: "",
      });
    }
  }, [defaultValue, reset]);


  const onSubmit = async (data: ApiProductVersionFormValues) => {
    try {
      if (isEditMode && defaultValue) {
        await updateVersion({
          id: defaultValue.id,
          productId: productId,
          payload: data,
        });
        toast.success("Version updated");
      } else {
        await createVersion({
          productId,
          payload: data,
        });
        toast.success("Version created");
      }

      onSuccess();
      onClose();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? "Edit Version" : "Add Version"}</DialogTitle>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <FormTextField fullWidth label="Version" name="version" />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                }}
              >
                <FormTextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 8,
                }}
              >
                <Controller
                  name="enable"
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
