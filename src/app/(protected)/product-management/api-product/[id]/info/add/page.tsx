"use client";

import { Paper, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ProductInfoForm from "@/app/(protected)/product-management/api-product/[id]/info/ProductInfoForm";
import { routes } from "@/app/routes.generated";
import useOrchestratorApiService, {
  ProductInfoRequest,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";

export default function AddProductInfo() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const { useAddProductInfo } = useOrchestratorApiService();
  const { mutateAsync, isPending } = useAddProductInfo();

  const onSubmit = async (data: ProductInfoRequest) => {
    try {
      await mutateAsync(
        { productId, payload: data },
        {
          onSuccess: () => {
            toast.success("Product info added successfully");
            router.push(
              routes["(protected)"]["product-management"]["api-product"].index +
                productId +
                "/info",
            );
          },
        },
      );
    } catch (err) {
      console.error("Failed to add product info:", err);
    }
  };

  return (
      <ProductInfoForm onSubmit={onSubmit} loading={isPending} isAdd={true} />
  );
}
