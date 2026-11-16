// lib/apis.ts
import { ApiClient } from "./apiClient";

export const idsrvApi = new ApiClient({
  name: "Identity Server",
  baseURL:
    process.env.NEXT_PUBLIC_IDENTITY_SERVER_URL_DEV || "http://idsrv.runasp.net",
});

export const coreApi = new ApiClient({
  name: "Core API",
  baseURL:
    (process.env.NEXT_PUBLIC_CORE_URL_DEV || "http://localhost:5196") +
    "/api/v1",
});

export const gatewayApi = new ApiClient({
  name: "Gateway API",
  baseURL:
    process.env.NEXT_PUBLIC_API_GATEWAY_URL_DEV || "http://apig-gateway.runasp.net/api",
});

export const orchestratorApi = new ApiClient({
  name: "Orchestrator API",
  baseURL:
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL_DEV ||
    "http://localhost:5264/api",
});
