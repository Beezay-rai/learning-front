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
} from "./interface/RestApiBuilderModel";

import { ApiUserModel, ApiUserRequest } from "./interface/ApiUserModel";

import { CoreApiDataResponse, CoreApiResponse } from "./common/CoreApiResponse";

import { PaginationRequest, PaginatedResponse } from "../common/PaginationModel";
import { coreApi, idsrvApi } from "@/lib/apis";
import { ApiConfig } from "@/lib/apiClient";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useAuth } from "@/lib/auth/useAuth";

export default function useCoreApiService() {
  const queryClient = useQueryClient();

  const CORE_QUERY_KEYS = {
    restApiBuilders: ["core", "restApiBuilders"] as const,
    restApiBuilderById: (id: number) => ["core", "restApiBuilder", id] as const,

    apiUsers: ["core", "apiUsers"] as const,
    apiUserById: (id: number) => ["core", "apiUser", id] as const,
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

  const getApiUsers = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await coreApi.get<CoreApiDataResponse<PaginatedResponse<ApiUserModel>>>(
        coreAPIRoutes.api_users,
        { ...apiConfig, axios_config: { params: pagination } },
      )
    ).data;

  const getApiUserById = async (id: number) =>
    (
      await coreApi.get<CoreApiDataResponse<ApiUserModel>>(
        `${coreAPIRoutes.api_users}/${id}`,
      )
    ).data;

  const addApiUser = async (payload: ApiUserRequest) =>
    (
      await coreApi.post<CoreApiDataResponse<ApiUserModel>>(
        coreAPIRoutes.api_users,
        payload,
        apiConfig,
      )
    ).data;

  const updateApiUser = async ({
    id,
    payload,
  }: {
    id: number;
    payload: ApiUserRequest;
  }) =>
    (
      await coreApi.put<CoreApiDataResponse<ApiUserModel>>(
        `${coreAPIRoutes.api_users}/${id}`,
        payload,
      )
    ).data;

  const deleteApiUser = async (id: number) =>
    (await coreApi.delete<CoreApiResponse>(`${coreAPIRoutes.api_users}/${id}`))
      .data;

  const useGetApiUsers = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<
        CoreApiDataResponse<PaginatedResponse<ApiUserModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: [...CORE_QUERY_KEYS.apiUsers, pagination],
      queryFn: () => getApiUsers(pagination),
      ...options,
    });

  const useGetApiUserById = (
    id: number,
    options?: Omit<
      UseQueryOptions<CoreApiDataResponse<ApiUserModel>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: CORE_QUERY_KEYS.apiUserById(id),
      queryFn: () => getApiUserById(id),
      enabled: !!id,
      ...options,
    });

  const useAddApiUser = () =>
    useMutation({
      mutationFn: addApiUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.apiUsers,
        }),
    });

  const useUpdateApiUser = () =>
    useMutation({
      mutationFn: updateApiUser,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.apiUsers,
        });
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.apiUserById(variables.id),
        });
      },
    });

  const useDeleteApiUser = () =>
    useMutation({
      mutationFn: deleteApiUser,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.apiUsers,
        });
        queryClient.invalidateQueries({
          queryKey: CORE_QUERY_KEYS.apiUserById(id),
        });
      },
    });

  return {
    useGetRestApiBuilders,
    useGetRestApiBuilderById,
    useAddRestApiBuilder,
    useUpdateRestApiBuilder,
    useDeleteRestApiBuilder,
    useGetApiUsers,
    useGetApiUserById,
    useAddApiUser,
    useUpdateApiUser,
    useDeleteApiUser,
  };
}
