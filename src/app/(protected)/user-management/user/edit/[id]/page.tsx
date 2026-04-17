"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import UserForm from "../../UserForm";
import {
  UpdateUserRequest,
  UserModel,
} from "@/services/apiServices/idsrv/interface/UserModel";
import NotFound from "@/app/not-found";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";

export default function AddAppUser() {
  const router = useRouter();

  const { useGetUserById, useUpdateUser } = useIdsrvService();
  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? Number(idParam) : 0;

  const { data: user, isLoading: isUserLoading } = useGetUserById(id, {
    enabled: id > 0,
  });

  console.log(user);
  const { mutateAsync, isPending: isSubmitting } = useUpdateUser();

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
        },
      );
    } catch (err) {
      console.error("Failed to add User:", err);
      toast.error("Failed to Update User");
    }
  };

  if (user === undefined && !isUserLoading) {
    return <NotFound />;
  }

  if (isUserLoading) {
    <CircularProgress size={24} />;
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
          defaultValue={user?.data}
          loading={isSubmitting}
          isAdd={false}
          cancelUrl={routes["(protected)"]["user-management"]["user"].index}
        />
      )}
    </Paper>
  );
}
