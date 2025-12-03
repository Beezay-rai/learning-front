"use client";

import { Box, Button, Grid, IconButton, Paper, TextField } from "@mui/material";
import {
  Controller,
  useForm,
  useFieldArray,
  FormProvider,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import * as yup from "yup";
import { routes } from "@/app/routes.generated";
import FormTextField from "@/components/molecules/FormTextField";
import { AddUserRequest } from "@/services/apiServices/idsrv/interface/UserModel";

const userSchema = yup.object({
  first_name: yup
    .string()
    .required("Name is required")
    .max(50, "Max 50 characters"),

  email: yup.string().required("Email is required").email("Invalid email"),

  // roles: yup
  //   .array()
  //   .of(yup.string().required())
  //   .min(1, "At least one role is required"),
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
  const formMethods = useForm<AddUserRequest>({
    resolver: yupResolver(userSchema),
    defaultValues: defaultValue,
  });

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "roles",
  // });

  return (
    <Paper
      elevation={3}
      sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Grid
            container
            spacing={2}
            sx={{
              p: 2,
            }}
          >
            <Grid size={4}>
              <FormTextField fullWidth label="Name" name="first_name" />
            </Grid>
            <Grid size={8}>
              <FormTextField fullWidth label="Description" name="email" />
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
                ? "Add Api"
                : "Update"}
            </Button>

            <Link href={routes["(protected)"]["user-management"].user.index}>
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
    </Paper>
  );
}
