"use client";

import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import coreApiService from "@/services/apiServices/core/coreApiService";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import UserForm from "../../UserForm";
import idsrvApiService from "@/services/apiServices/idsrv/idsrvApiService";
import {
  UpdateUserRequest,
  UserModel,
} from "@/services/apiServices/idsrv/interface/UserModel";
import NotFound from "@/app/not-found";

export default function AddAppUser() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? String(idParam) : "";
  console.log("Editing user with id:", id);

  const { data: user, isLoading: restApiBuilderLoading } =
    idsrvApiService.useGetUserById(id);

  const { mutateAsync, isPending: isSubmitting } =
    idsrvApiService.useUpdateUser();

  const onSubmit = async (data: UpdateUserRequest) => {
    try {
      await mutateAsync(
        {
          id: id,
          payload: data,
        },
        {
          onSuccess: () => {
            toast.success("Route Updated successfully!");
            router.push(routes["(protected)"].proxy["rest-builder"].index);
          },
        }
      );
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to Update route");
    }
  };

  if (user === undefined && !restApiBuilderLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Update User
      </Typography>

      <UserForm
        onSubmit={onSubmit}
        defaultValue={user}
        loading={isSubmitting}
        isAdd={false}
        cancelUrl={routes["(protected)"]["user-management"]["user"].index}
      />
    </Paper>
  );
}
