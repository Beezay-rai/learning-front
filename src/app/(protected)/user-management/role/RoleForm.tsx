"use client";

import { Box, Button, Grid } from "@mui/material";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import FormTextField from "@/components/molecules/FormTextField";
import FormSelect from "@/components/molecules/FormSelect";
import { idsrvApiSchema } from "@/services/apiServices/idsrv/schema/idsrvApiSchema";
import { UserType } from "@/services/apiServices/idsrv/enums/UserType";
import { routes } from "@/app/routes.generated";
import {
  AddRoleRequest,
  RoleModel,
  UpdateRoleRequest,
} from "@/services/apiServices/idsrv/interface/RoleModel";
import FormShell from "@/components/molecules/FormShell";
import FormActions from "@/components/molecules/FormActions";

interface RoleFormProps {
  onSubmit: (data: AddRoleRequest | UpdateRoleRequest) => void;
  loading?: boolean;
  defaultValue?: RoleModel;
  isAdd?: boolean;
}
const userTypeOptions = [
  { label: "Developer", value: UserType.Developer },
  { label: "QA", value: UserType.QA },
];
export default function RoleForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
}: RoleFormProps) {
  const formMethods = useForm<AddRoleRequest | UpdateRoleRequest>({
    resolver: yupResolver(
      isAdd ? idsrvApiSchema.role.Add : idsrvApiSchema.role.Update
    ) as Resolver<AddRoleRequest | UpdateRoleRequest>,
    defaultValues: defaultValue,
  });

  return (
    <FormProvider {...formMethods}>
      <FormShell title={isAdd ? "Add Role" : "Update Role"} description="Define a role and the user type it applies to." component="form" onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid size={6}>
            <FormTextField fullWidth label="Role Name" name="name" />
          </Grid>

          <Grid size={6}>
            <FormSelect
              name="userTypeId"
              label="User Type"
              options={userTypeOptions}
              fullWidth
            />
          </Grid>

          <Grid size={12}>
            <FormTextField
              fullWidth
              name="description"
              label="Description"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <FormActions submitLabel={isAdd ? "Add role" : "Update role"} loading={loading} cancel={<Link href={routes["(protected)"]["user-management"].role.index}><Button type="button" color="inherit" disabled={loading}>Cancel</Button></Link>} />
      </FormShell>
    </FormProvider>
  );
}
