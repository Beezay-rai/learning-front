"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/app/routes.generated";
import { ApiUserRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import useCoreApiService from "@/services/apiServices/core/useCoreApiService";
import ApiProductForm, { ApiProductRequest } from "../../ApiProductForm";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import NotFound from "@/app/(protected)/not-found";

export default function UpdateProduct() {
  const router = useRouter();

  const params = useParams();
  const idParam = params?.id;

  const id = idParam ? Number(idParam) : 0;
  const { useUpdateApiProduct, useGetApiProductById } =
    useOrchestratorApiService();

  const { mutateAsync, isPending } = useUpdateApiProduct();

  const { data: apiProduct, isLoading: apiProductLoading } =
    useGetApiProductById(id);

  const submit = async (data: ApiProductRequest) => {
    await mutateAsync(
      {
        id: id,
        payload: data,
      },
      {
        onSuccess: () => {
          toast.success("App User created!");
          router.push(
            routes["(protected)"]["user-management"]["api-user"].index,
          );
        },
      },
    );
  };

  if (apiProductLoading) return <CircularProgress></CircularProgress>;

  if (apiProduct === undefined && !apiProductLoading) {
    return <NotFound />;
  }
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Edit Api Product
      </Typography>

      <ApiProductForm
        onSubmit={submit}
        loading={isPending}
        isAdd={false}
        defaultValue={apiProduct as unknown as ApiProductRequest}
        cancelUrl={
          routes["(protected)"]["product-management"]["api-product"].index
        }
      />
    </Paper>
  );
}
