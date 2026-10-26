"use client";

import { Box, Button, Card, CardContent, Divider, FormControlLabel, IconButton, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

export type ScopeFormValues = {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  userClaims: { value: string }[];
};

type Props = {
  form: UseFormReturn<ScopeFormValues>;
  isEditing: boolean;
  isPending: boolean;
  onSubmit: (values: ScopeFormValues) => void;
  onCancel: () => void;
};

export default function ApiScopeForm({ form, isEditing, isPending, onSubmit, onCancel }: Props) {
  const { control, handleSubmit, formState, register } = form;
  const userClaims = useFieldArray({ control, name: "userClaims" });

  return (
    <FormShell title={isEditing ? "Update API Scope" : "Add API Scope"} description="Define the claims and metadata exposed by this scope.">
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>Scope details</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <TextField label="Name" {...register("name")} error={!!formState.errors.name} helperText={formState.errors.name?.message} />
                <TextField label="Display Name" {...register("displayName")} error={!!formState.errors.displayName} helperText={formState.errors.displayName?.message} />
              </Box>
              <TextField label="Description" multiline minRows={2} {...register("description")} error={!!formState.errors.description} helperText={formState.errors.description?.message} />
            </Stack>
          </CardContent>
        </Card>
        <Divider sx={{ my: 2.5 }} />
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1">User Claims</Typography>
          <Button type="button" variant="outlined" startIcon={<Plus size={16} />} onClick={() => userClaims.append({ value: "" })}>Add Entry</Button>
        </Box>
        {userClaims.fields.map((field, index) => (
          <Stack key={field.id} direction="row" spacing={1} alignItems="center">
            <Controller name={`userClaims.${index}.value`} control={control} render={({ field: input }) => <TextField {...input} label="User Claim" fullWidth />} />
            <Tooltip title="At least one claim is required" disableHoverListener={userClaims.fields.length !== 1}>
              <span><IconButton color="error" disabled={userClaims.fields.length === 1} onClick={() => userClaims.remove(index)}><Minus size={16} /></IconButton></span>
            </Tooltip>
          </Stack>
        ))}
              <FormControlLabel control={<Controller control={control} name="enabled" render={({ field }) => <Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} />} label="Enabled" />
            </Stack>
          </CardContent>
        </Card>
        <FormActions submitLabel={isEditing ? "Update scope" : "Add scope"} loading={isPending} cancel={<Button type="button" onClick={onCancel} color="inherit">Cancel</Button>} />
      </Box>
    </FormShell>
  );
}
