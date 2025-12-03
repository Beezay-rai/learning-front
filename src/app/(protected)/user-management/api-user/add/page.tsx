"use client";

import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import coreApiService from "@/services/apiServices/core/coreApiService";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import UserForm from "../UserForm";

export default function AddAppUser() {
  const router = useRouter();
  const { mutateAsync, isPending } = coreApiService.useAddApiUser();

  const submit = async (data: ApiUserRequest) => {
    await mutateAsync(data, {
      onSuccess: () => {
        toast.success("App User created!");
        router.push(routes["(protected)"]["user-management"]["api-user"].index);
      },
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Api User
      </Typography>

      <UserForm
        onSubmit={submit}
        loading={isPending}
        isAdd={true}
        cancelUrl={routes["(protected)"]["user-management"]["api-user"].index}
      />
    </Paper>
  );
}
