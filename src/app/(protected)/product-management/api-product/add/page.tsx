"use client";

import { Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import ApiProductForm, { ApiProductRequest } from "../ApiProductForm";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";

export default function AddProduct() {
  const router = useRouter();
  const { useAddApiProduct } = useOrchestratorApiService();
  const { mutateAsync, isPending } = useAddApiProduct();

  const submit = async (data: ApiProductRequest) => {
    await mutateAsync(data, {
      onSuccess: () => {
        toast.success("Api Product created!");
        router.push(routes["(protected)"]["product-management"]["api-product"].index);
      },
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add Api Product
      </Typography>

      <ApiProductForm onSubmit={submit} loading={isPending} isAdd={true} />
    </Paper>
  );
}
