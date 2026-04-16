import FormSelect from "@/components/molecules/FormSelect";
import FormTextField from "@/components/molecules/FormTextField";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface ApiConfigureModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (data: ApiConfigureFormData) => void;
  defaultValue?: ApiConfigureFormData;
  isLoading?: boolean;
}

export interface ApiConfigureFormData {
  auth?: string;
  certificate?: string;
  rateLimit?: number;
  enableLog?: boolean;
}

const EMPTY_FORM: ApiConfigureFormData = {
  auth: "",
  certificate: "",
  rateLimit: 0,
  enableLog: false,
};

export default function ApiConfigureModal({
  open,
  onClose,
  onUpdate,
  isLoading = false,
  defaultValue,
}: ApiConfigureModalProps) {
  const formMethods = useForm<ApiConfigureFormData>({
    defaultValues: defaultValue,
    disabled: isLoading,
  });

  const onSubmit = async (data: ApiConfigureFormData) => {
    try {
      await onUpdate(data);
      onClose();
    } catch (err) {
      console.error("Configuration failed:", err);
    }
  };
  const apiLog = formMethods.watch("enableLog");

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Configure API</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          <FormProvider {...formMethods}>
            {/* Auth Select */}
            <FormSelect
              name="auth"
              options={[
                {
                  label: "HMAC",
                  value: "HMAC",
                },
                {
                  label: "Basic",
                  value: "Basic",
                },
                {
                  label: "Bearer",
                  value: "Bearer",
                },
              ]}
            >

            </FormSelect>
            {/* <FormControl fullWidth>
            <InputLabel>Auth</InputLabel>
            <Select
              label="Auth"
              value={form.auth}
              onChange={(e) => handleChange("auth", e.target.value)}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="Basic">Basic </MenuItem>
              <MenuItem value="HMAC">HMAC </MenuItem>
              <MenuItem value="oauth">OAuth</MenuItem>
              <MenuItem value="apikey">API Key</MenuItem>
            </Select>
          </FormControl> */}

            {/* <FormSelect fullWidth name="certificate" options={[]}></FormSelect> */}

            {/* <FormControl fullWidth>
            <InputLabel>Certificate</InputLabel>

            <Select
              label="Certificate"
              value={form.certificate}
              onChange={(e) => handleChange("certificate", e.target.value)}
            >
              <MenuItem value="cert1">Certificate 1</MenuItem>
              <MenuItem value="cert2">Certificate 2</MenuItem>
            </Select>
          </FormControl> */}

            {/* Rate Limit */}

            <FormTextField
              name="rateLimit"
              label="Rate Limit (req/min)"
              type="number"
            />

            <FormControlLabel
              name="enableLog"
              control={
                <Switch
                  checked={apiLog}
                  onChange={(e) => {
                    formMethods.setValue("enableLog", e.target.checked);
                  }}
                />
              }
              label="Log Api"
            />
          </FormProvider>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={isLoading}
          color="error"
          variant="outlined"
        >
          Close
        </Button>
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={formMethods.handleSubmit(onSubmit)}
        >
          {isLoading ? `Updating...` : `Update`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
