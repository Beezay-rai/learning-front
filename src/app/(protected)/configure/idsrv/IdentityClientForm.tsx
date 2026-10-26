"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { Link2, Minus, Plus, Settings2, ShieldCheck } from "lucide-react";

export type ClientFormValues = {
  clientId: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string;
  requireConsent: boolean;
  requirePkce: boolean;
  redirectUris: { value: string }[];
  postLogoutRedirectUris: { value: string }[];
  allowedScopes: { value: string }[];
  allowedCorsOrigins: { value: string }[];
};

type Props = {
  form: UseFormReturn<ClientFormValues>;
  isEditing: boolean;
  isPending: boolean;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
};

function Entries({
  label,
  fieldName,
  form,
}: {
  label: string;
  fieldName:
    | "redirectUris"
    | "postLogoutRedirectUris"
    | "allowedScopes"
    | "allowedCorsOrigins";
  form: UseFormReturn<ClientFormValues>;
}) {
  const { control } = form;
  const fields = useFieldArray({ control, name: fieldName });

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        <Button type="button" size="small" variant="outlined" startIcon={<Plus size={15} />} onClick={() => fields.append({ value: "" })}>
          Add entry
        </Button>
      </Box>
      {fields.fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1} alignItems="center">
          <Controller
            name={`${fieldName}.${index}.value`}
            control={control}
            render={({ field: input }) => <TextField {...input} size="small" placeholder={`Enter ${label.toLowerCase()}`} fullWidth />}
          />
          <Tooltip title="At least one entry is required" disableHoverListener={fields.fields.length !== 1}>
            <span>
              <IconButton size="small" color="error" disabled={fields.fields.length === 1} onClick={() => fields.remove(index)}>
                <Minus size={16} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ))}
    </Stack>
  );
}

export default function IdentityClientForm({
  form,
  isEditing,
  isPending,
  onSubmit,
  onCancel,
}: Props) {
  const { control, handleSubmit, formState, register } = form;

  return (
    <Paper elevation={0} sx={{ mt: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, bgcolor: "action.hover", borderRadius: "8px 8px 0 0" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ShieldCheck size={24} />
          <Box>
            <Typography variant="h6">{isEditing ? "Update Identity Client" : "Add Identity Client"}</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure how this application connects to the identity server.
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Settings2 size={18} />
                  <Typography variant="subtitle1" fontWeight={600}>Client details</Typography>
                </Stack>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField label="Client ID" placeholder="my-web-app" {...register("clientId")} error={!!formState.errors.clientId} helperText={formState.errors.clientId?.message} fullWidth />
                  <TextField label="Client Name" placeholder="My Web App" {...register("clientName")} error={!!formState.errors.clientName} helperText={formState.errors.clientName?.message} fullWidth />
                  <TextField label="Client Secret" type="password" placeholder={isEditing ? "Leave blank to keep current secret" : "Enter client secret"} {...register("clientSecret")} error={!!formState.errors.clientSecret} helperText={formState.errors.clientSecret?.message} fullWidth />
                  <TextField label="Grant Type" select {...register("grantTypes")} fullWidth>
                    <MenuItem value="authorization_code">authorization_code</MenuItem>
                    <MenuItem value="client_credentials">client_credentials</MenuItem>
                  </TextField>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Link2 size={18} />
                  <Typography variant="subtitle1" fontWeight={600}>Application endpoints and access</Typography>
                </Stack>
                <Entries label="Redirect URI" fieldName="redirectUris" form={form} />
                <Entries label="Post Logout Redirect URI" fieldName="postLogoutRedirectUris" form={form} />
                <Entries label="Allowed Scope" fieldName="allowedScopes" form={form} />
                <Entries label="Allowed CORS Origin" fieldName="allowedCorsOrigins" form={form} />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Security options</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControlLabel control={<Controller control={control} name="requireConsent" render={({ field }) => <Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} />} label="Require consent" />
                <FormControlLabel control={<Controller control={control} name="requirePkce" render={({ field }) => <Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} />} label="Require PKCE" />
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button type="button" onClick={onCancel} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>{isEditing ? "Update client" : "Add client"}</Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
