"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormTextField from "@/components/molecules/FormTextField";
import { ApiUserKeyRequest } from "@/services/apiServices/core/interface/ApiUserModel";

const keySchema = yup.object({
  keyName: yup.string().required("Key name is required").max(100),
  permissions: yup.string().required("Permissions are required").max(500),
});

export interface GenerateKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ApiUserKeyRequest) => void;
  loading?: boolean;
}

export default function GenerateKeyModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: GenerateKeyModalProps) {
  const formMethods = useForm<ApiUserKeyRequest>({
    resolver: yupResolver(keySchema),
    defaultValues: {
      keyName: "",
      permissions: "",
    },
  });

  const handleFormSubmit = (data: ApiUserKeyRequest) => {
    onSubmit(data);
  };

  const handleClose = () => {
    formMethods.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate New Key</DialogTitle>
      
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(handleFormSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid size={12}>
                <FormTextField
                  fullWidth
                  name="keyName"
                  label="Key Name"
                  placeholder="e.g., prod-api-key"
                  disabled={loading}
                />
              </Grid>
              <Grid size={12}>
                <FormTextField
                  fullWidth
                  name="permissions"
                  label="Permissions"
                  placeholder="e.g., read,write"
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="error"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Key"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
