"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
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

  const { data: user, isLoading: isUserLoading } =
    idsrvApiService.useGetUserById(id, {
      enabled: !!id,
    });

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
            toast.success("User Updated successfully!");
            router.push(routes["(protected)"]["user-management"].user.index);
          },
        }
      );
    } catch (err) {
      console.error("Failed to add User:", err);
      toast.error("Failed to Update User");
    }
  };

  if (user === undefined && !isUserLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Update User
      </Typography>

      {isUserLoading ? (
        <CircularProgress size={24} />
      ) : (
        <UserForm
          onSubmit={onSubmit}
          defaultValue={user}
          loading={isSubmitting}
          isAdd={false}
          cancelUrl={routes["(protected)"]["user-management"]["user"].index}
        />
      )}
    </Paper>
  );
}
