"use client";

import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import RoleForm from "../RoleForm";
import { AddRoleRequest } from "@/services/apiServices/idsrv/interface/RoleModel";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";

export default function AddAppRole() {
  const router = useRouter();
  const { useAddRole } = useIdsrvService();
  const { mutateAsync, isPending } = useAddRole();

  const submit = async (data: AddRoleRequest) => {
    await mutateAsync(data, {
      onSuccess: () => {
        toast.success(" Role created !");
        router.push(routes["(protected)"]["user-management"]["role"].index);
      },
      onError: (err) => {
        toast.error("Failed to create Role  !");
        console.log(err);
      },
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Role
      </Typography>

      <RoleForm onSubmit={submit} loading={isPending} isAdd={true} />
    </Paper>
  );
}
