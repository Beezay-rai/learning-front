"use client";

import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import coreApiService from "@/services/apiServices/core/coreApiService";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import UserForm from "../UserForm";
import { AddUserRequest } from "@/services/apiServices/idsrv/interface/UserModel";
import idsrvApiService from "@/services/apiServices/idsrv/idsrvApiService";

export default function AddAppUser() {
  const router = useRouter();
  const { mutateAsync, isPending } = idsrvApiService.useAddUser();

  const submit = async (data: AddUserRequest) => {
    await mutateAsync(data, {
      onSuccess: () => {
        toast.success(" User created !");
        router.push(routes["(protected)"]["user-management"]["user"].index);
      },
      onError: (err) => {
        toast.error("Failed to create User  !");
        console.log(err);
      },
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add User
      </Typography>

      <UserForm
        onSubmit={submit}
        loading={isPending}
        isAdd={true}
        cancelUrl={routes["(protected)"]["user-management"]["user"].index}
      />
    </Paper>
  );
}
