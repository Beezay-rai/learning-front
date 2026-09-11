"use client";

import { CircularProgress, Paper, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ProductInfoForm from "@/app/(protected)/product-management/api-product/[id]/info/ProductInfoForm";
import { routes } from "@/app/routes.generated";
import useOrchestratorApiService, {
  ProductInfoRequest,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import NotFound from "@/app/(protected)/not-found";

export default function EditProductInfo() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  const infoId = Number(params?.infoId);

  const { useGetProductInfoById, useUpdateProductInfo } =
    useOrchestratorApiService();

  const { data: productInfoRes, isLoading } = useGetProductInfoById(
    productId,
    infoId,
    { enabled: !!productId && !!infoId },
  );

  const { mutateAsync, isPending } = useUpdateProductInfo();

  const onSubmit = async (data: ProductInfoRequest) => {
    try {
      await mutateAsync(
        { productId, infoId, payload: data },
        {
          onSuccess: () => {
            toast.success("Product info updated successfully");
            router.push(
              routes["(protected)"]["product-management"]["api-product"].index +
                productId +
                "/info",
            );
          },
        },
      );
    } catch (err) {
      console.error("Failed to update product info:", err);
    }
  };

  if (isLoading) return <CircularProgress size={24} />;
  if (!productInfoRes?.data) return <NotFound />;

  const { name, description, isActive } = productInfoRes.data;

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Edit Product Info
      </Typography>
      <ProductInfoForm
        onSubmit={onSubmit}
        loading={isPending}
        isAdd={false}
        defaultValue={{ name, description, isActive }}
      />
    </Paper>
  );
}
