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
      <form
        onSubmit={formMethods.handleSubmit(onSubmit, (errors) => {
          console.log("❌ Form Submission Errors:", errors);
        })}
      >
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
              ? "Add User"
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
  );
}
