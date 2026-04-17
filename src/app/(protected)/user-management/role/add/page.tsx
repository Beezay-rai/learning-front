"use client";

import { Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import RoleForm from "../RoleForm";
import {
  AddRoleRequest,
  UpdateRoleRequest,
} from "@/services/apiServices/idsrv/interface/RoleModel";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";

export default function AddAppRole() {
  const router = useRouter();
  const { useAddRole } = useIdsrvService();
  const { mutateAsync, isPending } = useAddRole();

  const submit = async (data: AddRoleRequest | UpdateRoleRequest) => {
    if (typeof data.userTypeId !== "number") {
      toast.error("User type is required");
      return;
    }

    const payload: AddRoleRequest = {
      name: data.name,
      description: data.description,
      userTypeId: data.userTypeId,
    };

    await mutateAsync(payload, {
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
