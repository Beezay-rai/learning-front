// lib/apis.ts
import { ApiClient } from "./apiClient";

export const idsrvApi = new ApiClient({
  baseURL:
    (process.env.IDENTITY_SERVER_URL_DEV || "https://localhost:5082") + "/api",
});

export const coreApi = new ApiClient({
  baseURL: (process.env.CORE_URL_DEV || "http://localhost:5196") + "/api/v1",
});

export const gatewayApi = new ApiClient({
  baseURL: process.env.API_GATEWAY_URL_DEV || "http://localhost:5274/api",
});

export const orchestratorApi = new ApiClient({
  baseURL: process.env.ORCHESTRATOR_URL_DEV || "http://localhost:5264/api",
});
