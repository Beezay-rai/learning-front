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
import { ApiUserRequest } from "@/services/apiServices/core/interface/apiUserModel";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

const userSchema = yup.object({
  name: yup.string().required("Name is required").max(50, "Max 50 characters"),
  userName: yup
    .string()
    .required("Username is required")
    .max(50, "Max 50 characters"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Min 6 characters"),

  // email: yup.string().required("Email is required").email("Invalid email"),

  // roles: yup
  //   .array()
  //   .of(yup.string().required())
  //   .min(1, "At least one role is required"),
});
interface UserFormProps {
  onSubmit: (data: ApiUserRequest) => void;
  loading?: boolean;
  defaultValue?: ApiUserRequest;
  isAdd?: boolean;
  cancelUrl: string;
}

export default function ApiUserForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
  cancelUrl,
}: UserFormProps) {
  const formMethods = useForm<ApiUserRequest>({
    resolver: yupResolver(userSchema),
    defaultValues: defaultValue,
  });

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "roles",
  // });

  return (
    <FormProvider {...formMethods}>
      <FormShell title={isAdd ? "Add API User" : "Update API User"} description="Manage credentials and access for an API consumer." component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Grid
          container
          spacing={2}
          sx={{
            p: 2,
          }}
        >
          <Grid size={4}>
            <FormTextField fullWidth label="Name" name="name" />
          </Grid>
          <Grid size={8}>
            <FormTextField fullWidth label="Description" name="description" />
          </Grid>
          <Grid size={4}>
            <FormTextField fullWidth label="Username" name="userName" />
          </Grid>
          <Grid size={4}>
            <FormTextField
              fullWidth
              type="password"
              label="Password"
              name="password"
            />
          </Grid>
        </Grid>

        <FormActions submitLabel={isAdd ? "Add user" : "Update user"} loading={loading} cancel={<Link href={cancelUrl}><Button type="button" color="inherit" disabled={loading}>Cancel</Button></Link>} />
      </FormShell>
    </FormProvider>
  );
}
