import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import myApiClient from "./apiClient";
import { AddClusterRequest, Cluster } from "./interfaces/cluster";
import { RouteRequest, Route } from "./interfaces/route";

const getAllRoutes = async (): Promise<PaginatedResponse<Route>> => {
  const response = await myApiClient.get(`/v1/routes`);
  return response.data.data;
};

const getRouteById = async (id: number): Promise<Route> => {
  const response = await myApiClient.get(`/v1/routes/` + id);
  return response.data.data;
};

const addRoute = async (data: RouteRequest): Promise<Route> => {
  const response = await myApiClient.post(`/v1/routes`, data);
  return response.data.data;
};

const updateRoute = async (data: RouteRequest): Promise<Route> => {
  const response = await myApiClient.put(`/v1/routes`, data);
  return response.data.data;
};

const getAllClusters = async (): Promise<PaginatedResponse<Cluster>> => {
  const response = await myApiClient.get(`/v1/clusters`);
  return response.data.data;
};

const addCluster = async (data: AddClusterRequest): Promise<Cluster> => {
  const response = await myApiClient.post(`/v1/clusters`, data);
  return response.data.data;
};

const serverApiService = {
  getRouteById: (id: number) => getRouteById(id),
  getAllClusters: () => getAllClusters(),
  createRoute: (data: RouteRequest) => addRoute(data),
  updateRoute: (id: number, data: RouteRequest) => updateRoute(data),
};

const apiService = {
  useGetRoutes: (page: number = 1) => {
    return useQuery({
      queryKey: ["routes", page],
      queryFn: getAllRoutes,
    });
  },
  useGetRouteById: (
    id: number,
    options?: Omit<
      UseQueryOptions<Route, Error, Route, ["routes", number | undefined]>,
      "queryKey" | "queryFn"
    >
  ) => {
    return useQuery({
      queryKey: ["routes", id],
      queryFn: () => getRouteById(id),
      ...options,
    });
  },

  useAddRoute: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addRoute,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["routes"] });
      },
    });
  },

  useUpdateRoute: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateRoute,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["routes"] });
      },
    });
  },

  useGetClusters: (page: number = 1) => {
    return useQuery({
      queryKey: ["clusters", page],
      queryFn: getAllClusters,
    });
  },

  useAddCluster: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: addCluster,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["clusters"] });
      },
    });
  },
};

export { apiService, serverApiService };
