"use client";

import { Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import useCoreApiService from "@/services/apiServices/core/useCoreApiService";
import ApiProductForm, { ApiProductRequest } from "../ApiProductForm";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";

export default function AddProduct() {
  const router = useRouter();
  const { useAddApiProduct } = useOrchestratorApiService();
  const { mutateAsync, isPending } = useAddApiProduct();

  const submit = async (data: ApiProductRequest) => {
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
        Add Api Product
      </Typography>

      <ApiProductForm
        onSubmit={submit}
        loading={isPending}
        isAdd={true}
      />
    </Paper>
  );
}
