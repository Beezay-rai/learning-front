"use client";

import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import * as yup from "yup";

const userSchema = yup.object({
  name: yup.string().required("Name is required").max(50, "Max 50 characters"),

  email: yup.string().required("Email is required").email("Invalid email"),

  roles: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one role is required"),
});
interface UserFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  defaultValue?: any;
  isAdd?: boolean;
  cancelUrl: string;
}

export default function UserForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
  cancelUrl,
}: UserFormProps) {
  const { control, handleSubmit, formState } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: defaultValue ?? {
      name: "",
      email: "",
      roles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* TOP INPUTS */}
      <Grid container spacing={2}>
        {/* NAME */}
        <Grid size={5}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                error={!!formState.errors.name}
                // helperText={formState.errors.name?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* ADD ROLE BUTTON */}
        <Grid size={2}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => append("")}
          >
            Add Role
          </Button>
        </Grid>
      </Grid>

      {/* DYNAMIC ROLES */}
      {fields.map((field, index) => (
        <Grid container key={field.id} spacing={2} alignItems="center">
          <Grid size={11}>
            <Controller
              name={`roles.${index}`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`Role #${index + 1}`}
                  // error={!!formState.errors.roles?.[index]}
                  // helperText={formState.errors.roles?.[index]?.message}
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={1}>
            <IconButton color="error" onClick={() => remove(index)}>
              <Minus />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      {/* ACTION BUTTONS */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
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
            ? "Add User"
            : "Update"}
        </Button>

        <Link href={cancelUrl}>
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
    </Box>
  );
}
