import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { idsrvApi } from "@/lib/apis";
import { idsrvApiRoutes } from "./idsrvApiRoutes";
import {
  PaginatedResponse,
  PaginationRequest,
} from "../common/PaginationModel";
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
import {
  AddApiScopeRequest,
  AddIdentityClientRequest,
  ApiScopeModel,
  IdentityClientModel,
  UpdateApiScopeRequest,
  UpdateIdentityClientRequest,
} from "./interface/IdentityConfigModel";
import { ApiConfig } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/useAuth";

export default function useIdsrvService() {
  const queryClient = useQueryClient();
  const { oidc_user } = useAuth();

  const apiConfig: ApiConfig = {
    auth_type: "Bearer",
    auth_token: oidc_user?.access_token,
  };

  // --- QUERY KEYS ---
  const IDSRV_QUERY_KEYS = {
    clients: ["idsrv", "clients"] as const,
    clientById: (id: number) => ["idsrv", "client", id] as const,
    apiScopes: ["idsrv", "api-scopes"] as const,
    apiScopeById: (id: number) => ["idsrv", "api-scope", id] as const,
    users: ["idsrv", "users"] as const,
    userById: (id: number) => ["idsrv", "user", id] as const,
    roles: ["idsrv", "roles"] as const,
    roleById: (id: number) => ["idsrv", "role", id] as const,
  };

  const getAllClients = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await idsrvApi.get<
        IdsrvApiDataResponse<PaginatedResponse<IdentityClientModel>>
      >(idsrvApiRoutes.clients, {
        ...apiConfig,
        axios_config: {
          params: pagination,
        },
      })
    ).data;

  const getClientById = async (id: number) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<IdentityClientModel>>(
        `${idsrvApiRoutes.clients}/${id}`,
        apiConfig,
      )
    ).data;

  const addClient = async (payload: AddIdentityClientRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<IdentityClientModel>>(
        idsrvApiRoutes.clients,
        payload,
        apiConfig,
      )
    ).data;

  const updateClient = async ({
    id,
    payload,
  }: {
    id: number;
    payload: UpdateIdentityClientRequest;
  }) =>
    (
      await idsrvApi.put<IdsrvApiDataResponse<IdentityClientModel>>(
        `${idsrvApiRoutes.clients}/${id}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteClient = async (id: number) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvApiRoutes.clients}/${id}`,
        apiConfig,
      )
    ).data;

  const getAllApiScopes = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await idsrvApi.get<
        IdsrvApiDataResponse<PaginatedResponse<ApiScopeModel>>
      >(idsrvApiRoutes.apiScopes, {
        ...apiConfig,
        axios_config: {
          params: pagination,
        },
      })
    ).data;

  const getApiScopeById = async (id: number) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<ApiScopeModel>>(
        `${idsrvApiRoutes.apiScopes}/${id}`,
        apiConfig,
      )
    ).data;

  const addApiScope = async (payload: AddApiScopeRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<ApiScopeModel>>(
        idsrvApiRoutes.apiScopes,
        payload,
        apiConfig,
      )
    ).data;

  const updateApiScope = async ({
    id,
    payload,
  }: {
    id: number;
    payload: UpdateApiScopeRequest;
  }) =>
    (
      await idsrvApi.put<IdsrvApiDataResponse<ApiScopeModel>>(
        `${idsrvApiRoutes.apiScopes}/${id}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteApiScope = async (id: number) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvApiRoutes.apiScopes}/${id}`,
        apiConfig,
      )
    ).data;

  const getAllUsers = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<PaginatedResponse<UserModel>>>(
        idsrvApiRoutes.users,
        {
          ...apiConfig,
          axios_config: {
            params: pagination,
          },
        },
      )
    ).data;

  const getUserById = async (id: number) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<UserModel>>(
        `${idsrvApiRoutes.users}/${id}`,
        apiConfig,
      )
    ).data;

  const addUser = async (payload: AddUserRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<UserModel>>(
        idsrvApiRoutes.users,
        payload,
        apiConfig,
      )
    ).data;

  const updateUser = async ({
    id,
    payload,
  }: {
    id: number;
    payload: UpdateUserRequest;
  }) =>
    (
      await idsrvApi.put<IdsrvApiDataResponse<UserModel>>(
        `${idsrvApiRoutes.users}/${id}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteUser = async (id: number) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvApiRoutes.users}/${id}`,
        apiConfig,
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
    >,
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.users, pagination],
      queryFn: () => getAllUsers(pagination),
      ...options,
    });

  const useGetUserById = (
    id: number,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<UserModel>, Error>,
      "queryKey" | "queryFn"
    >,
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
    filter: GetAllRoleFilterModel = new PaginationRequest(),
  ) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<PaginatedResponse<RoleModel>>>(
        idsrvApiRoutes.roles,
        {
          ...apiConfig,
          axios_config: {
            params: filter,
          },
        },
      )
    ).data;

  const getRoleById = async (id: number) =>
    (
      await idsrvApi.get<IdsrvApiDataResponse<RoleModel>>(
        `${idsrvApiRoutes.roles}/${id}`,
        apiConfig,
      )
    ).data;

  const addRole = async (payload: AddRoleRequest) =>
    (
      await idsrvApi.post<IdsrvApiDataResponse<RoleModel>>(
        idsrvApiRoutes.roles,
        payload,
        apiConfig,
      )
    ).data;

  const updateRole = async ({
    id,
    payload,
  }: {
    id: number;
    payload: UpdateRoleRequest;
  }) =>
    (
      await idsrvApi.put<IdsrvApiDataResponse<RoleModel>>(
        `${idsrvApiRoutes.roles}/${id}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteRole = async (id: number) =>
    (
      await idsrvApi.delete<IdsrvApiResponse>(
        `${idsrvApiRoutes.roles}/${id}`,
        apiConfig,
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
    >,
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.roles, filter],
      queryFn: () => getAllRoles(filter),
      ...options,
    });

  const useGetClients = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<
        IdsrvApiDataResponse<PaginatedResponse<IdentityClientModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.clients, pagination],
      queryFn: () => getAllClients(pagination),
      ...options,
    });

  const useGetClientById = (
    id: number,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<IdentityClientModel>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: IDSRV_QUERY_KEYS.clientById(id),
      queryFn: () => getClientById(id),
      ...options,
    });

  const useAddClient = () =>
    useMutation({
      mutationFn: addClient,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.clients }),
    });

  const useUpdateClient = () =>
    useMutation({
      mutationFn: updateClient,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.clients });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.clientById(variables.id),
        });
      },
    });

  const useDeleteClient = () =>
    useMutation({
      mutationFn: deleteClient,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.clients });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.clientById(id),
        });
      },
    });

  const useGetApiScopes = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<
        IdsrvApiDataResponse<PaginatedResponse<ApiScopeModel>>,
        Error
      >,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: [...IDSRV_QUERY_KEYS.apiScopes, pagination],
      queryFn: () => getAllApiScopes(pagination),
      ...options,
    });

  const useGetApiScopeById = (
    id: number,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<ApiScopeModel>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: IDSRV_QUERY_KEYS.apiScopeById(id),
      queryFn: () => getApiScopeById(id),
      ...options,
    });

  const useAddApiScope = () =>
    useMutation({
      mutationFn: addApiScope,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.apiScopes }),
    });

  const useUpdateApiScope = () =>
    useMutation({
      mutationFn: updateApiScope,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.apiScopes });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.apiScopeById(variables.id),
        });
      },
    });

  const useDeleteApiScope = () =>
    useMutation({
      mutationFn: deleteApiScope,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: IDSRV_QUERY_KEYS.apiScopes });
        queryClient.invalidateQueries({
          queryKey: IDSRV_QUERY_KEYS.apiScopeById(id),
        });
      },
    });

  const useGetRoleById = (
    id: number,
    options?: Omit<
      UseQueryOptions<IdsrvApiDataResponse<RoleModel>, Error>,
      "queryKey" | "queryFn"
    >,
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
    useGetClients,
    useGetClientById,
    useAddClient,
    useUpdateClient,
    useDeleteClient,
    useGetApiScopes,
    useGetApiScopeById,
    useAddApiScope,
    useUpdateApiScope,
    useDeleteApiScope,
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
