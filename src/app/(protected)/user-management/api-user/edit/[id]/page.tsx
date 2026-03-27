"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import ApiUserForm from "../../ApiUserForm";
import NotFound from "@/app/not-found";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";

export default function AddAppUser() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? Number(idParam) : 0;
  const { useGetApiUserById, useUpdateApiUser } = useOrchestratorApiService();

  const { data: user, isLoading: restApiBuilderLoading } =
    useGetApiUserById(id);

  const { mutateAsync, isPending: isSubmitting } = useUpdateApiUser();

  const onSubmit = async (data: ApiUserRequest) => {
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
        },
      );
    } catch (err) {
      console.error("Failed to add route:", err);
      toast.error("Failed to Update route");
    }
  };

  if (restApiBuilderLoading) return <CircularProgress></CircularProgress>;

  if (user === undefined && !restApiBuilderLoading) {
    return <NotFound />;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Update Api User
      </Typography>

      <ApiUserForm
        onSubmit={onSubmit}
        defaultValue={user?.data}
        loading={isSubmitting}
        isAdd={false}
        cancelUrl={routes["(protected)"]["user-management"]["api-user"].index}
      />
    </Paper>
  );
}
