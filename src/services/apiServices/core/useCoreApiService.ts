import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { coreAPIRoutes } from "./coreApiRoutes";
import {
  RestApiBuilderModel,
  RestApiBuilderRequest,
} from "./interface/restApiBuilderModel";

import { ApiUserModel, ApiUserRequest } from "./interface/apiUserModel";

import { CoreApiDataResponse, CoreApiResponse } from "./common/coreApiResponse";

import {
  PaginationRequest,
  PaginatedResponse,
} from "../common/PaginationModel";
import { coreApi, idsrvApi } from "@/lib/apis";
import { ApiConfig } from "@/lib/apiClient";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useAuth } from "@/lib/auth/useAuth";

export default function useCoreApiService() {
  const queryClient = useQueryClient();

  const CORE_QUERY_KEYS = {
    restApiBuilders: ["core", "restApiBuilders"] as const,
    restApiBuilderById: (id: number) => ["core", "restApiBuilder", id] as const,
  };
  const { oidc_user } = useAuth();

  const apiConfig: ApiConfig = {
    auth_type: "Bearer",
    auth_token: oidc_user?.access_token,
  };

  const getRestApiBuilders = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await coreApi.get<
        CoreApiDataResponse<PaginatedResponse<RestApiBuilderModel>>
      >(
        coreAPIRoutes.builder.restApi,

        { axios_config: { params: pagination } },
      )
    ).data;

  const getRestApiBuilderById = async (id: number) =>
    (
      await coreApi.get<CoreApiDataResponse<RestApiBuilderModel>>(
        `${coreAPIRoutes.builder.restApi}/${id}`,
      )
    ).data;

  const addRestApiBuilder = async (payload: RestApiBuilderRequest) =>
    (
      await coreApi.post<CoreApiDataResponse<RestApiBuilderModel>>(
        coreAPIRoutes.builder.restApi,
        payload,
      )
    ).data;

  const updateRestApiBuilder = async ({
    id,
    payload,
  }: {
    id: number;
    payload: RestApiBuilderRequest;
  }) =>
    (
      await coreApi.put<CoreApiDataResponse<RestApiBuilderModel>>(
        `${coreAPIRoutes.builder.restApi}/${id}`,
        payload,
      )
    ).data;

  const deleteRestApiBuilder = async (id: number) =>
    (
      await coreApi.delete<CoreApiResponse>(
        `${coreAPIRoutes.builder.restApi}/${id}`,
      )
    ).data;

  const useGetRestApiBuilders = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<
        CoreApiDataResponse<PaginatedResponse<RestApiBuilderModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: [...CORE_QUERY_KEYS.restApiBuilders, pagination],
      queryFn: () => getRestApiBuilders(pagination),
      ...options,
    });

  const useGetRestApiBuilderById = (
    id: number,
    options?: Omit<
      UseQueryOptions<CoreApiDataResponse<RestApiBuilderModel>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: CORE_QUERY_KEYS.restApiBuilderById(id),
      queryFn: () => getRestApiBuilderById(id),
      enabled: !!id,
      ...options,
    });

  const useAddRestApiBuilder = () =>
    useMutation({
      mutationFn: addRestApiBuilder,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.restApiBuilders,
        }),
    });

  const useUpdateRestApiBuilder = () =>
    useMutation({
      mutationFn: updateRestApiBuilder,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.restApiBuilders,
        });
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.restApiBuilderById(variables.id),
        });
      },
    });

  const useDeleteRestApiBuilder = () =>
    useMutation({
      mutationFn: deleteRestApiBuilder,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.restApiBuilders,
        });
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.restApiBuilderById(id),
        });
      },
    });

  return {
    useGetRestApiBuilders,
    useGetRestApiBuilderById,
    useAddRestApiBuilder,
    useUpdateRestApiBuilder,
    useDeleteRestApiBuilder,
  };
}
