"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import coreApiService from "@/services/apiServices/core/coreApiService";
import RoleForm from "../../RoleForm";
import idsrvApiService from "@/services/apiServices/idsrv/idsrvApiService";
import {
  UpdateRoleRequest,
  RoleModel,
} from "@/services/apiServices/idsrv/interface/RoleModel";
import NotFound from "@/app/not-found";

export default function AddAppRole() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? String(idParam) : "";

  const { data: role, isLoading: isRoleLoading } =
    idsrvApiService.useGetRoleById(id, {
      enabled: !!id,
    });

  const { mutateAsync, isPending: isSubmitting } =
    idsrvApiService.useUpdateRole();

  const onSubmit = async (data: UpdateRoleRequest) => {
    try {
      await mutateAsync(
        {
          id: id,
          payload: data,
        },
        {
          onSuccess: () => {
            toast.success("Role Updated successfully!");
            router.push(routes["(protected)"]["user-management"].role.index);
          },
        }
      );
    } catch (err) {
      console.error("Failed to add Role:", err);
      toast.error("Failed to Update Role");
    }
  };

  if (role === undefined && !isRoleLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Update Role
      </Typography>

      {isRoleLoading ? (
        <CircularProgress size={24} />
      ) : (
        <RoleForm
          onSubmit={onSubmit}
          defaultValue={role.data}
          loading={isSubmitting}
          isAdd={false}
        />
      )}
    </Paper>
  );
}
