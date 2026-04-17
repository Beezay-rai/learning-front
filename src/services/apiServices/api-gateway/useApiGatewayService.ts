import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { gatewayApi } from "@/lib/apis";
import { ApiConfig } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth/useAuth";

import {
  RouteRequest,
  Route,
  RouteConfigureRequest,
  RouteConfigure,
} from "./interfaces/route";
import { ClusterRequest, Cluster } from "./interfaces/cluster";
import { PaginatedResponse } from "./interfaces/common/paginatedResponse";
import {
  GatewayApiDataResponse,
  GatewayApiResponse,
} from "./interfaces/GatewayApiResponse";
import { PaginationRequest } from "../common/PaginationModel";

export default function useApiGatewayService() {
  const queryClient = useQueryClient();
  const { oidc_user } = useAuth();

  const apiConfig: ApiConfig = {
    auth_type: "Bearer",
    auth_token: oidc_user?.access_token,
  };

  // --------------------
  // QUERY KEYS
  // --------------------
  const QUERY_KEYS = {
    routes: ["gateway", "routes"] as const,
    routeById: (id: number) => ["gateway", "route", id] as const,
    configRouteById: (id: number) =>
      ["gateway", "route", "config", id] as const,

    clusters: ["gateway", "clusters"] as const,
    clusterById: (id: number) => ["gateway", "cluster", id] as const,
  };

  const getAllRoutes = async () =>
    (
      await gatewayApi.get<GatewayApiDataResponse<PaginatedResponse<Route>>>(
        "/v1/routes",
        apiConfig,
      )
    ).data;

  const getRouteById = async (id: number) =>
    (
      await gatewayApi.get<GatewayApiDataResponse<Route>>(
        `/v1/routes/${id}`,
        apiConfig,
      )
    ).data;

  const getRouteConfigureById = async (id: number) =>
    (
      await gatewayApi.get<GatewayApiDataResponse<RouteConfigure>>(
        `/v1/routes/${id}/configure`,
        apiConfig,
      )
    ).data;
  const configureRouteById = async ({
    id,
    payload,
  }: {
    id: number;
    payload: RouteConfigureRequest;
  }) =>
    (
      await gatewayApi.post<GatewayApiDataResponse<Route>>(
        `/v1/routes/${id}/configure`,
        payload,
        apiConfig,
      )
    ).data;

  const addRoute = async (payload: RouteRequest) =>
    (
      await gatewayApi.post<GatewayApiDataResponse<Route>>(
        "/v1/routes",
        payload,
        apiConfig,
      )
    ).data;

  const updateRoute = async ({
    routeId,
    payload,
  }: {
    routeId: number;
    payload: RouteRequest;
  }) =>
    (
      await gatewayApi.put<GatewayApiDataResponse<Route>>(
        `/v1/routes/${routeId}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteRoute = async (id: number) =>
    (await gatewayApi.delete<GatewayApiResponse>(`/v1/routes/${id}`, apiConfig))
      .data;

  // --------------------
  // ROUTES – HOOKS
  // --------------------
  const useGetRoutes = (
    pagination?: PaginationRequest,
    options?: Omit<
      UseQueryOptions<GatewayApiDataResponse<PaginatedResponse<Route>>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.routes,
      queryFn: getAllRoutes,
      ...options,
    });

  const useGetRouteById = (
    id: number,
    options?: Omit<
      UseQueryOptions<GatewayApiDataResponse<Route>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.routeById(id),
      queryFn: () => getRouteById(id),
      ...options,
    });

  const useGetRouteConfigureById = (
    id: number,
    options?: Omit<
      UseQueryOptions<GatewayApiDataResponse<RouteConfigure>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.configRouteById(id),
      queryFn: () => getRouteConfigureById(id),
      ...options,
    });

  const useAddRoute = () =>
    useMutation({
      mutationFn: addRoute,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routes }),
    });
  const useConfigureRouteById = () =>
    useMutation({
      mutationFn: configureRouteById,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.configRouteById(variables.id),
        });
      },
    });

  const useUpdateRoute = () =>
    useMutation({
      mutationFn: updateRoute,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routes });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.routeById(variables.routeId),
        });
      },
    });

  const useDeleteRoute = () =>
    useMutation({
      mutationFn: deleteRoute,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routes });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.routeById(id),
        });
      },
    });

  // ====================
  // CLUSTERS – API
  // ====================
  const getAllClusters = async (
    pagination: PaginationRequest = new PaginationRequest(),
  ) =>
    (
      await gatewayApi.get<GatewayApiDataResponse<PaginatedResponse<Cluster>>>(
        "/v1/clusters",
        { ...apiConfig, axios_config: { params: pagination } },
      )
    ).data;

  const getClusterById = async (id: number) =>
    (
      await gatewayApi.get<GatewayApiDataResponse<Cluster>>(
        `/v1/clusters/${id}`,
        apiConfig,
      )
    ).data;

  const addCluster = async (payload: ClusterRequest) =>
    (
      await gatewayApi.post<GatewayApiDataResponse<Cluster>>(
        "/v1/clusters",
        payload,
        apiConfig,
      )
    ).data;

  const updateCluster = async ({
    clusterId,
    payload,
  }: {
    clusterId: number;
    payload: ClusterRequest;
  }) =>
    (
      await gatewayApi.put<GatewayApiDataResponse<Cluster>>(
        `/v1/clusters/${clusterId}`,
        payload,
        apiConfig,
      )
    ).data;

  const deleteCluster = async (id: number) =>
    (
      await gatewayApi.delete<GatewayApiResponse>(
        `/v1/clusters/${id}`,
        apiConfig,
      )
    ).data;

  // --------------------
  // CLUSTERS – HOOKS
  // --------------------
  const useGetClusters = (
    pagination: PaginationRequest = new PaginationRequest(),
    options?: Omit<
      UseQueryOptions<
        GatewayApiDataResponse<PaginatedResponse<Cluster>>,
        Error
      >,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.clusters,
      queryFn: () => getAllClusters(pagination),
      ...options,
    });

  const useGetClusterById = (
    id: number,
    options?: Omit<
      UseQueryOptions<GatewayApiDataResponse<Cluster>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.clusterById(id),
      queryFn: () => getClusterById(id),
      ...options,
    });

  const useAddCluster = () =>
    useMutation({
      mutationFn: addCluster,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clusters }),
    });

  const useUpdateCluster = () =>
    useMutation({
      mutationFn: updateCluster,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clusters });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.clusterById(variables.clusterId),
        });
      },
    });

  const useDeleteCluster = () =>
    useMutation({
      mutationFn: deleteCluster,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clusters });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.clusterById(id),
        });
      },
    });

  return {
    // routes
    useGetRoutes,
    useGetRouteById,
    useGetRouteConfigureById,
    useConfigureRouteById,
    useAddRoute,
    useUpdateRoute,
    useDeleteRoute,

    // clusters
    useGetClusters,
    useGetClusterById,
    useAddCluster,
    useUpdateCluster,
    useDeleteCluster,
  };
}
