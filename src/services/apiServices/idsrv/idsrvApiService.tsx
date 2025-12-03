import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import idsrvApiClient from "./idsrvApiClient";
import { idsrvAPIRoutes } from "./idsrvAPIRoutes";
import {
  PaginatedResponse,
  PaginationRequest,
} from "./interface/PaginationModel";
import {
  AddUserRequest,
  UpdateUserRequest,
  UserModel,
} from "./interface/UserModel";
import {
  IdsrvApiDataResponse,
  IdsrvApiResponse,
} from "./interface/IdsrvApiResponse";
import {
  AddRoleRequest,
  RoleModel,
  UpdateRoleRequest,
} from "./interface/RoleModel";

const QUERY_KEYS = {
  users: ["idsrv", "user"] as const,
  userById: (id: string) => ["idsrv", "userById", id] as const,
  roles: ["idsrv", "role"] as const,
  roleById: (id: string) => ["idsrv", "roleById", id] as const,
};

const getAllUsers = async (
  pagination: PaginationRequest = new PaginationRequest()
) =>
  (
    await idsrvApiClient.get<PaginatedResponse<UserModel>>(
      idsrvAPIRoutes.users,
      {
        params: pagination,
      }
    )
  ).data;

const getUserById = async (id: string) =>
  (
    await idsrvApiClient.get<IdsrvApiDataResponse<UserModel>>(
      `${idsrvAPIRoutes.users}/${id}`
    )
  ).data;

const addUser = async (payload: AddUserRequest) =>
  (
    await idsrvApiClient.post<IdsrvApiDataResponse<UserModel>>(
      idsrvAPIRoutes.users,
      payload
    )
  ).data;

const updateUser = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateUserRequest;
}) =>
  (
    await idsrvApiClient.put<IdsrvApiDataResponse<UserModel>>(
      `${idsrvAPIRoutes.users}/${id}`,
      payload
    )
  ).data;

const deleteUser = async (id: number) =>
  (
    await idsrvApiClient.delete<IdsrvApiResponse>(
      `${idsrvAPIRoutes.users}/${id}`
    )
  ).data;

const getAllRoles = async (
  pagination: PaginationRequest = new PaginationRequest()
) =>
  (
    await idsrvApiClient.get<PaginatedResponse<RoleModel>>(
      idsrvAPIRoutes.roles,
      {
        params: pagination,
      }
    )
  ).data;

const getRoleById = async (id: string) =>
  await idsrvApiClient.get<IdsrvApiDataResponse<RoleModel>>(
    `${idsrvAPIRoutes.roles}/${id}`
  );

const addRole = async (payload: AddRoleRequest) =>
  (
    await idsrvApiClient.post<IdsrvApiDataResponse<RoleModel>>(
      idsrvAPIRoutes.roles,
      payload
    )
  ).data;

const updateRole = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateRoleRequest;
}) =>
  (
    await idsrvApiClient.put<IdsrvApiDataResponse<RoleModel>>(
      `${idsrvAPIRoutes.roles}/${id}`,
      payload
    )
  ).data;

const deleteRole = async (id: string) =>
  (
    await idsrvApiClient.delete<IdsrvApiResponse>(
      `${idsrvAPIRoutes.roles}/${id}`
    )
  ).data;

const idsrvApiService = {
  useGetUsers: (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<PaginatedResponse<UserModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...QUERY_KEYS.users, pagination],
      queryFn: () => getAllUsers(pagination),
      ...options,
    }),

  useGetUserById: (
    id: string,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<UserModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.userById(id),
      queryFn: () => getUserById(id),
      ...options,
    }),

  useAddUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.users,
        }),
    });
  },

  useUpdateUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.users,
        }),
    });
  },

  useDeleteUser: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: deleteUser,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.users,
        }),
    });
  },

  useGetRoles: (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<PaginatedResponse<RoleModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...QUERY_KEYS.roles, pagination],
      queryFn: () => getAllRoles(pagination),
      ...options,
    }),

  useGetRoleById: (
    id: string,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<RoleModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.roleById(id),
      queryFn: () => getRoleById(id),
      ...options,
    }),

  useAddRole: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addRole,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.roles,
        }),
    });
  },

  useUpdateRole: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateRole,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.roles,
        }),
    });
  },

  useDeleteRole: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: deleteRole,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.roles,
        }),
    });
  },
};

export default idsrvApiService;
