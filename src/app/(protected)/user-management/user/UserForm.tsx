"use client";

import { Box, Button, Grid, IconButton, Paper, TextField } from "@mui/material";
import {
  Controller,
  useForm,
  useFieldArray,
  FormProvider,
  Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import * as yup from "yup";
import { routes } from "@/app/routes.generated";
import FormTextField from "@/components/molecules/FormTextField";
import {
  AddUserRequest,
  UpdateUserRequest,
  UserModel,
} from "@/services/apiServices/idsrv/interface/UserModel";
import { idsrvApiSchema } from "@/services/apiServices/idsrv/schema/idsrvApiSchema";
import FormSelect from "@/components/molecules/FormSelect";
import FormUtility from "@/utils/formUtility";
import { UserType } from "@/services/apiServices/idsrv/enums/UserType";
import FormRoleSelect from "@/components/molecules/FormRoleSelect";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

interface UserFormProps {
  onSubmit: (data: AddUserRequest | UpdateUserRequest) => void;
  loading?: boolean;
  defaultValue?: UserModel;
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
  const formMethods = useForm<AddUserRequest | UpdateUserRequest>({
    resolver: yupResolver(
      isAdd ? idsrvApiSchema.users.Add : idsrvApiSchema.users.Update
    ) as unknown as Resolver<AddUserRequest | UpdateUserRequest>,
    defaultValues: defaultValue,
  });

  return (
    <FormProvider {...formMethods}>
      <FormShell title={isAdd ? "Add System User" : "Update System User"} description="Set the user's profile, role, and contact details." component="form" onSubmit={formMethods.handleSubmit(onSubmit, (errors) => {
          console.log("❌ Form Submission Errors:", errors);
        })}>
        <Grid
          container
          spacing={2}
          sx={{
            p: 2,
          }}
        >
          <Grid size={4}>
            <FormSelect
              label="User Type"
              name="user_type_id"
              options={FormUtility.enumToSelectOptions(UserType)}
            />
          </Grid>

          <Grid size={4}>
            <FormRoleSelect
              label="Role"
              name="role_id"
              user_type_id_name="user_type_id"
            />
          </Grid>
          <Grid size={4}>
            <FormTextField fullWidth label="First Name" name="first_name" />
          </Grid>
          <Grid size={4}>
            <FormTextField fullWidth label="Last Name" name="last_name" />
          </Grid>
          <Grid size={4}>
            <FormTextField fullWidth label="Phone Number" name="phone_number" />
          </Grid>
          <Grid size={8}>
            <FormTextField fullWidth label="Email" name="email" />
          </Grid>
        </Grid>

        <FormActions submitLabel={isAdd ? "Add user" : "Update user"} loading={loading} cancel={<Link href={cancelUrl}><Button type="button" color="inherit" disabled={loading}>Cancel</Button></Link>} />
      </FormShell>
    </FormProvider>
  );
}
