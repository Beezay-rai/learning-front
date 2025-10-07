import myApiClient from "./apiClient";
import { AddClusterRequest, Cluster } from "./interfaces/cluster";

const apiService = {
  login: async (data: login): Promise<void> => {},

  getAllClusters: async (): Promise<PaginatedResponse<Cluster>> => {
    try {
      const response = await myApiClient.get<
        ApiResponse<PaginatedResponse<Cluster>>
      >("/v1/clusters");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
  },
  addCluster: async (data: AddClusterRequest): Promise<Cluster> => {
    try {
      const response = await myApiClient.post<ApiResponse<Cluster>>(
        "/v1/clusters"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
  },

  getAllRoutes: async (): Promise<PaginatedResponse<Route>> => {
    try {
      const response = await myApiClient.get<
        ApiResponse<PaginatedResponse<Route>>
      >("/v1/routes");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching routes:", error);
      throw error;
    }
  },
};

export { apiService };
