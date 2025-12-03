import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import coreApiClient from "./coreApiClient";
import { coreAPIRoutes } from "./coreApiRoutes";

import {
  RestApiBuilderModel,
  RestApiBuilderRequest,
} from "./interface/RestApiBuilderModel";

import { ApiUserModel, ApiUserRequest } from "./interface/ApiUserModel";

import { CoreApiDataResponse, CoreApiResponse } from "./common/CoreApiResponse";

import { PaginationRequest, PaginatedResponse } from "./common/PaginationModel";

const QUERY_KEYS = {
  restApiBuilders: ["core", "restApiBuilders"] as const,
  restApiBuilderById: (id: number) =>
    ["core", "restApiBuilderById", id] as const,

  apiUsers: ["core", "apiUsers"] as const,
  apiUserById: (id: number) => ["core", "apiUserById", id] as const,
};

const fetchRestApiBuilders = async (
  pagination: PaginationRequest = new PaginationRequest()
) =>
  (
    await coreApiClient.get<PaginatedResponse<RestApiBuilderModel>>(
      coreAPIRoutes.builder.restApi,
      { params: pagination }
    )
  ).data;

const fetchRestApiBuilderById = async (id: number) =>
  (
    await coreApiClient.get<CoreApiDataResponse<RestApiBuilderModel>>(
      `${coreAPIRoutes.builder.restApi}/${id}`
    )
  ).data;

const createRestApiBuilder = async (payload: RestApiBuilderRequest) =>
  (
    await coreApiClient.post<CoreApiDataResponse<RestApiBuilderModel>>(
      coreAPIRoutes.builder.restApi,
      payload
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
    await coreApiClient.put<CoreApiDataResponse<RestApiBuilderModel>>(
      `${coreAPIRoutes.builder.restApi}/${id}`,
      payload
    )
  ).data;

const deleteRestApiBuilder = async (id: number) =>
  (
    await coreApiClient.delete<CoreApiResponse>(
      `${coreAPIRoutes.builder.restApi}/${id}`
    )
  ).data;

const fetchApiUsers = async (
  pagination: PaginationRequest = new PaginationRequest()
) =>
  (
    await coreApiClient.get<PaginatedResponse<ApiUserModel>>(
      coreAPIRoutes.api_users,
      { params: pagination }
    )
  ).data;

const fetchApiUserById = async (id: number) =>
  (
    await coreApiClient.get<CoreApiDataResponse<ApiUserModel>>(
      `${coreAPIRoutes.api_users}/${id}`
    )
  ).data;

const createApiUser = async (payload: ApiUserRequest) =>
  (
    await coreApiClient.post<CoreApiDataResponse<ApiUserModel>>(
      coreAPIRoutes.api_users,
      payload
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
    await coreApiClient.put<CoreApiDataResponse<ApiUserModel>>(
      `${coreAPIRoutes.api_users}/${id}`,
      payload
    )
  ).data;

const deleteApiUser = async (id: number) =>
  (
    await coreApiClient.delete<CoreApiResponse>(
      `${coreAPIRoutes.api_users}/${id}`
    )
  ).data;

const coreApiService = {
  useGetRestApiBuilders: (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<PaginatedResponse<RestApiBuilderModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...QUERY_KEYS.restApiBuilders, pagination],
      queryFn: () => fetchRestApiBuilders(pagination),
      ...options,
    }),

  useGetRestApiBuilderById: (
    id: number,
    options?: Omit<
      UseQueryOptions<CoreApiDataResponse<RestApiBuilderModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.restApiBuilderById(id),
      queryFn: () => fetchRestApiBuilderById(id),
      enabled: !!id,
      ...options,
    }),

  useAddRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createRestApiBuilder,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.restApiBuilders,
        }),
    });
  },

  useUpdateRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateRestApiBuilder,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.restApiBuilders,
        }),
    });
  },

  useDeleteRestApiBuilder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: deleteRestApiBuilder,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.restApiBuilders,
        }),
    });
  },

  useGetApiUsers: (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<PaginatedResponse<ApiUserModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...QUERY_KEYS.apiUsers, pagination],
      queryFn: () => fetchApiUsers(pagination),
      ...options,
    }),

  useGetApiUserById: (
    id: number,
    options?: Omit<
      UseQueryOptions<CoreApiDataResponse<ApiUserModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.apiUserById(id),
      queryFn: () => fetchApiUserById(id),
      enabled: !!id,
      ...options,
    }),

  useAddApiUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createApiUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.apiUsers,
        }),
    });
  },

  useUpdateApiUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateApiUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.apiUsers,
        }),
    });
  },

  useDeleteApiUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: deleteApiUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.apiUsers,
        }),
    });
  },
};

export default coreApiService;
