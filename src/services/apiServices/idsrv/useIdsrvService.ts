import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { idsrvApi } from "@/lib/apis";
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
  GetAllRoleFilterModel,
  RoleModel,
  UpdateRoleRequest,
} from "./interface/RoleModel";
import useGetUserInfo from "@/hooks/useGetUserInfo";
import { ApiConfig } from "@/lib/apiClient";

export default function useIdsrvService() {
  const queryClient = useQueryClient();
  const { userDetail } = useGetUserInfo();

  const apiConfig: ApiConfig = {
    auth_type: "Bearer",
    auth_token: userDetail.oidc_user.access_token,
  };

  // --- QUERY KEYS ---
  const IDSRV_QUERY_KEYS = {
    users: ["idsrv", "users"] as const,
    userById: (id: string) => ["idsrv", "user", id] as const,
    roles: ["idsrv", "roles"] as const,
    roleById: (id: string) => ["idsrv", "role", id] as const,
  };

  const getAllUsers = async (
    pagination: PaginationRequest = new PaginationRequest()
  ) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<PaginatedResponse<UserModel>>>(
        idsrvAPIRoutes.users,
        {
          ...apiConfig,
          axios_config: {
            params: pagination,
          },
        }
      )
    ).data;

  const getUserById = async (id: string) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<UserModel>>(
        `${idsrvAPIRoutes.users}/${id}`,
        apiConfig
      )
    ).data;

  const addUser = async (payload: AddUserRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<UserModel>>(
        idsrvAPIRoutes.users,
        payload,
        apiConfig
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
      await idsrvApi.put<IdsrvApiDataResponse<UserModel>>(
        `${idsrvAPIRoutes.users}/${id}`,
        payload,
        apiConfig
      )
    ).data;

  const deleteUser = async (id: string) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvAPIRoutes.users}/${id}`,
        apiConfig
      )
    ).data;

  // --- User Hooks ---

  const useGetUsers = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<
        IdsrvApiDataResponse<PaginatedResponse<UserModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.users, pagination],
      queryFn: () => getAllUsers(pagination),
      ...options,
    });

  const useGetUserById = (
    id: string,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<UserModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: IDSRV_QUERY_KEYS.userById(id),
      queryFn: () => getUserById(id),
      ...options,
    });

  const useAddUser = () =>
    useMutation({
      mutationFn: addUser,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.users }),
    });

  const useUpdateUser = () =>
    useMutation({
      mutationFn: updateUser,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.users }); // list
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.userById(variables.id),
        });
      },
    });

  const useDeleteUser = () =>
    useMutation({
      mutationFn: deleteUser,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.users }); // list
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.userById(id),
        });
      },
    });

  const getAllRoles = async (
    filter: GetAllRoleFilterModel = new PaginationRequest()
  ) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<PaginatedResponse<RoleModel>>>(
        idsrvAPIRoutes.roles,
        {
          ...apiConfig,
          axios_config: {
            params: filter,
          },
        }
      )
    ).data;

  const getRoleById = async (id: string) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<RoleModel>>(
        `${idsrvAPIRoutes.roles}/${id}`,
        apiConfig
      )
    ).data;

  const addRole = async (payload: AddRoleRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<RoleModel>>(
        idsrvAPIRoutes.roles,
        payload,
        apiConfig
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
      await idsrvApi.put<IdsrvApiDataResponse<RoleModel>>(
        `${idsrvAPIRoutes.roles}/${id}`,
        payload,
        apiConfig
      )
    ).data;

  const deleteRole = async (id: string) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvAPIRoutes.roles}/${id}`,
        apiConfig
      )
    ).data;

  // --- Role Hooks ---

  const useGetRoles = (
    filter?: GetAllRoleFilterModel,
    options?: Omit<
      UseQueryOptions<
        IdsrvApiDataResponse<PaginatedResponse<RoleModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.roles, filter],
      queryFn: () => getAllRoles(filter),
      ...options,
    });

  const useGetRoleById = (
    id: string,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<RoleModel>, Error>,
      "queryKey" | "queryFn"
    >
  ) =>
    useQuery({
      queryKey: IDSRV_QUERY_KEYS.roleById(id),
      queryFn: () => getRoleById(id),
      ...options,
    });

  const useAddRole = () =>
    useMutation({
      mutationFn: addRole,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.roles }),
    });

  const useUpdateRole = () =>
    useMutation({
      mutationFn: updateRole,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.roles });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.roleById(variables.id),
        });
      },
    });

  const useDeleteRole = () =>
    useMutation({
      mutationFn: deleteRole,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.roles });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.roleById(id),
        });
      },
    });

  return {
    useGetUsers,
    useGetUserById,
    useAddUser,
    useUpdateUser,
    useDeleteUser,
    useGetRoles,
    useGetRoleById,
    useAddRole,
    useUpdateRole,
    useDeleteRole,
  };
}
