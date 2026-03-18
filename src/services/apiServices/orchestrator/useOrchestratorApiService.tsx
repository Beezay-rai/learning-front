import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { orchestratorApi } from "@/lib/apis";
import { ApiConfig } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/useAuth";

/* =========================
   Interfaces
========================= */
export interface Product {
  id: number;
  name: string;
  description: string;
  created_Date: string;
  updated_Date: string;
}

export interface ProductVersion {
  id: number;
  productId: number;
  version: string;
  description: string;
  enable: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface PaginationRequest {
  page?: number;
  size?: number;
}

export interface ApiDataResponse<T> {
  data: T;
  message: string;
  status: boolean;
}

export interface ProductApiEndpoint {
  id: number;
  productVersionId: number;
  name: string;
  description: string;
  apiPath: string;
  runTimeExecutioner: string;
  executionerId: string;
  isEnabled: boolean;
  isDeprecated: boolean;
}

/* =========================
   API Routes
========================= */
const apiProductRoutes = {
  products: "/products",
  productById: (id: number) => `/products/${id}`,
  versions: (productId: number) => `/products/${productId}/versions`,
  versionById: (productId: number, id: number) =>
    `/products/${productId}/versions/${id}`,

  endpoints: (productId: number, versionId: number) =>
    `/products/${productId}/versions/${versionId}/endpoints`,
  endpointById: (productId: number, versionId: number, endpointId: number) =>
    `/products/${productId}/versions/${versionId}/endpoints/${endpointId}`,
};


export default function useOrchestratorApiService() {
  const queryClient = useQueryClient();
  const { oidc_user } = useAuth();

  const apiConfig: ApiConfig = {
    auth_type: "Bearer",
    auth_token: oidc_user?.access_token,
  };


  const QUERY_KEYS = {
    products: ["products"] as const,
    productById: (id: number) => ["products", id] as const,
    versions: (productId: number) =>
      ["products", productId, "versions"] as const,

    endpoints: (productId: number, versionId: number) =>
      ["products", productId, "versions", versionId, "endpoints"] as const,
    endpointById: (productId: number, versionId: number, endpointId: number) =>
      ["products", productId, "versions", versionId, "endpoints", endpointId] as const,
  };


  const getProducts = async (pagination?: PaginationRequest) =>
    (
      await orchestratorApi.get<ApiDataResponse<PaginatedResponse<Product>>>(
        apiProductRoutes.products,
        {
          ...apiConfig,
          axios_config: { params: pagination },
        },
      )
    ).data;

  const getProductById = async (id: number) =>
    (
      await orchestratorApi.get<ApiDataResponse<Product>>(
        apiProductRoutes.productById(id),
        apiConfig,
      )
    ).data;

  const addProduct = async (payload: Pick<Product, "name" | "description">) =>
    (
      await orchestratorApi.post<ApiDataResponse<Product>>(
        apiProductRoutes.products,
        payload,
        apiConfig,
      )
    ).data;

  const updateProduct = async ({
    id,
    payload,
  }: {
    id: number;
    payload: Pick<Product, "name" | "description">;
  }) =>
    (
      await orchestratorApi.put<ApiDataResponse<Product>>(
        apiProductRoutes.productById(id),
        payload,
        apiConfig,
      )
    ).data;

  const deleteProduct = async (id: number) =>
    (
      await orchestratorApi.delete<ApiDataResponse<null>>(
        apiProductRoutes.productById(id),
        apiConfig,
      )
    ).data;

  /* =========================
     API Calls – Versions
  ========================= */
  const getProductVersions = async (productId: number) =>
    (
      await orchestratorApi.get<ApiDataResponse<ProductVersion[]>>(
        apiProductRoutes.versions(productId),
        apiConfig,
      )
    ).data;

  const addProductVersion = async ({
    productId,
    payload,
  }: {
    productId: number;
    payload: Omit<ProductVersion, "id" | "productId">;
  }) =>
    (
      await orchestratorApi.post<ApiDataResponse<ProductVersion>>(
        apiProductRoutes.versions(productId),
        payload,
        apiConfig,
      )
    ).data;

  const updateProductVersion = async ({
    productId,
    id,
    payload,
  }: {
    productId: number;
    id: number;
    payload: Omit<ProductVersion, "id" | "productId">;
  }) =>
    (
      await orchestratorApi.put<ApiDataResponse<ProductVersion>>(
        apiProductRoutes.versionById(productId, id),
        payload,
        apiConfig,
      )
    ).data;

  const deleteProductVersion = async ({
    productId,
    id,
  }: {
    productId: number;
    id: number;
  }) =>
    (
      await orchestratorApi.delete<ApiDataResponse<null>>(
        apiProductRoutes.versionById(productId, id),
        apiConfig,
      )
    ).data;

  /* =========================
   API Calls – Endpoints
========================= */
  const getProductApiEndpoints = async (productId: number, versionId: number) =>
    (
      await orchestratorApi.get<ApiDataResponse<ProductApiEndpoint[]>>(
        apiProductRoutes.endpoints(productId, versionId),
        apiConfig,
      )
    ).data;

  const addProductApiEndpoint = async ({
    productId,
    versionId,
    payload,
  }: {
    productId: number;
    versionId: number;
    payload: Omit<
      ProductApiEndpoint,
      "id" | "productVersionId" | "isDeprecated"
    >;
  }) =>
    (
      await orchestratorApi.post<ApiDataResponse<ProductApiEndpoint>>(
        apiProductRoutes.endpoints(productId, versionId),
        payload,
        apiConfig,
      )
    ).data;

  const updateProductApiEndpoint = async ({
    productId,
    versionId,
    id,
    payload,
  }: {
    productId: number;
    versionId: number;
    id: number;
    payload: Omit<
      ProductApiEndpoint,
      "id" | "productVersionId" | "isDeprecated"
    >;
  }) =>
    (
      await orchestratorApi.put<ApiDataResponse<ProductApiEndpoint>>(
        apiProductRoutes.endpointById(productId, versionId, id),
        payload,
        apiConfig,
      )
    ).data;

  const deleteProductApiEndpoint = async ({
    productId,
    versionId,
    id,
  }: {
    productId: number;
    versionId: number;
    id: number;
  }) =>
    (
      await orchestratorApi.delete<ApiDataResponse<null>>(
        apiProductRoutes.endpointById(productId, versionId, id),
        apiConfig,
      )
    ).data;
  // API Call
  const getProductApiEndpointById = async (
    productId: number,
    versionId: number,
    endpointId: number,
  ) =>
    (
      await orchestratorApi.get<ApiDataResponse<ProductApiEndpoint>>(
        apiProductRoutes.endpointById(productId, versionId, endpointId),
        apiConfig,
      )
    ).data;

  /* =========================
     React Query Hooks
  ========================= */
  const useGetApiProducts = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<ApiDataResponse<PaginatedResponse<Product>>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: [...QUERY_KEYS.products, pagination],
      queryFn: () => getProducts(pagination),
      ...options,
    });

  const useGetApiProductById = (id: number) =>
    useQuery({
      queryKey: QUERY_KEYS.productById(id),
      queryFn: () => getProductById(id),
    });

  const useAddApiProduct = () =>
    useMutation({
      mutationFn: addProduct,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
    });

  const useUpdateApiProduct = () =>
    useMutation({
      mutationFn: updateProduct,
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.productById(vars.id),
        });
      },
    });

  const useDeleteApiProduct = () =>
    useMutation({
      mutationFn: deleteProduct,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.productById(id),
        });
      },
    });

  const useGetApiProductVersions = (productId: number) =>
    useQuery({
      queryKey: QUERY_KEYS.versions(productId),
      queryFn: () => getProductVersions(productId),
      enabled: !!productId,
    });

  const useAddApiProductVersion = () =>
    useMutation({
      mutationFn: addProductVersion,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.versions(vars.productId),
        }),
    });

  const useUpdateApiProductVersion = () =>
    useMutation({
      mutationFn: updateProductVersion,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.versions(vars.productId),
        }),
    });

  const useDeleteApiProductVersion = () =>
    useMutation({
      mutationFn: deleteProductVersion,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.versions(vars.productId),
        }),
    });

  /* =========================
   React Query Hooks – Endpoints
========================= */
  const useGetProductApiEndpoints = (productId: number, versionId: number) =>
    useQuery({
      queryKey: QUERY_KEYS.endpoints(productId, versionId),
      queryFn: () => getProductApiEndpoints(productId, versionId),
      enabled: !!productId && !!versionId,
    });

  const useAddProductApiEndpoint = () =>
    useMutation({
      mutationFn: addProductApiEndpoint,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.endpoints(vars.productId, vars.versionId),
        }),
    });

  const useUpdateProductApiEndpoint = () =>
    useMutation({
      mutationFn: updateProductApiEndpoint,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.endpoints(vars.productId, vars.versionId),
        }),
    });

  const useDeleteProductApiEndpoint = () =>
    useMutation({
      mutationFn: deleteProductApiEndpoint,
      onSuccess: (_, vars) =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.endpoints(vars.productId, vars.versionId),
        }),
    });
  const useGetProductApiEndpointById = (
    productId: number,
    versionId: number,
    endpointId: number,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.endpointById(productId, versionId, endpointId),
      queryFn: () => getProductApiEndpointById(productId, versionId, endpointId),
      enabled: !!productId && !!versionId && !!endpointId,
    });


  return {
    // Products
    useGetApiProducts,
    useGetApiProductById,
    useAddApiProduct,
    useUpdateApiProduct,
    useDeleteApiProduct,

    // Versions
    useGetApiProductVersions,
    useAddApiProductVersion,
    useUpdateApiProductVersion,
    useDeleteApiProductVersion,

    // 🔽 Endpoints
    useGetProductApiEndpoints,
    useAddProductApiEndpoint,
    useUpdateProductApiEndpoint,
    useDeleteProductApiEndpoint,
    useGetProductApiEndpointById,

  };
}
