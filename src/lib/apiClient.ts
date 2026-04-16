// lib/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";
import { networkLogStore } from "./networkLogStore";

export interface ApiClientOptions {
  baseURL: string;
  /** A friendly name for this client instance (shown in network logs) */
  name?: string;
}

export interface ApiConfig {
  auth_type?: "Bearer" | "Custom";
  auth_token?: string;
  customHeaders?: Record<string, string>;
  axios_config?: AxiosRequestConfig;
}

export class ApiClient {
  private client: AxiosInstance;
  private name: string;

  constructor(options: ApiClientOptions) {
    this.name = options.name || options.baseURL;
    this.client = axios.create({
      baseURL: options.baseURL,
    });

    // ── Network Log: Request Interceptor ──────────────────────────
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const id = networkLogStore.addEntry({
          source: this.name,
          method: (config.method || "GET").toUpperCase(),
          url: config.url || "",
          fullUrl: `${config.baseURL || ""}${config.url || ""}`,
          status: null,
          statusText: "",
          startTime: Date.now(),
          endTime: null,
          duration: null,
          requestHeaders: this.flattenHeaders(config.headers),
          responseHeaders: {},
          requestBody: config.data ?? null,
          responseBody: null,
          error: null,
          pending: true,
          size: null,
        });
        // Stash the log-entry id on the config so the response interceptor can find it
        (config as any)._networkLogId = id;
        (config as any)._networkLogStart = performance.now();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // ── Network Log: Response Interceptor (success) ───────────────
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const id: string | undefined = (response.config as any)
          ._networkLogId;
        const start: number | undefined = (response.config as any)
          ._networkLogStart;
        if (id) {
          const size = this.estimateSize(response.data);
          networkLogStore.updateEntry(id, {
            status: response.status,
            statusText: response.statusText,
            endTime: Date.now(),
            duration:
              start !== undefined ? Math.round(performance.now() - start) : null,
            responseHeaders: this.flattenHeaders(response.headers),
            responseBody: response.data,
            pending: false,
            size,
          });
        }
        return response;
      },
      (error) => {
        // ── Network Log: Response Interceptor (error) ─────────────
        const config = error.config || error.response?.config;
        const id: string | undefined = config?._networkLogId;
        const start: number | undefined = config?._networkLogStart;
        if (id) {
          networkLogStore.updateEntry(id, {
            status: error.response?.status ?? null,
            statusText: error.response?.statusText ?? "",
            endTime: Date.now(),
            duration:
              start !== undefined ? Math.round(performance.now() - start) : null,
            responseHeaders: error.response
              ? this.flattenHeaders(error.response.headers)
              : {},
            responseBody: error.response?.data ?? null,
            error:
              error.response?.data?.message ||
              error.message ||
              "Something went wrong",
            pending: false,
            size: error.response
              ? this.estimateSize(error.response.data)
              : null,
          });
        }

        // ── Original error handling (unchanged) ───────────────────
        const customError: any = {
          message:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong",
          status: error.response?.status,
          data: error.response?.data,
        };

        switch (customError.status) {
          case 400:
            toast.error("Invalid Data Provided ! ");
            break;
          case 401:
            console.log("Unauthorized! redirect to login");
            break;
          case 403:
            console.log("Forbidden! show forbidden component");
            break;
          case 404:
            console.log("Not Found  !");
            break;
          case 500:
            console.log("Server error! show server error component");
            break;
        }

        return Promise.reject(customError);
      }
    );
  }

  /** Flatten axios headers object to Record<string, string> */
  private flattenHeaders(headers: any): Record<string, string> {
    if (!headers) return {};
    const flat: Record<string, string> = {};
    if (typeof headers.forEach === "function") {
      headers.forEach((value: string, key: string) => {
        flat[key] = value;
      });
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === "string") {
          flat[key] = value;
        } else if (value !== undefined && value !== null) {
          flat[key] = String(value);
        }
      });
    }
    return flat;
  }

  /** Rough byte-size estimate for response body */
  private estimateSize(data: any): number | null {
    if (data === null || data === undefined) return null;
    try {
      const str =
        typeof data === "string" ? data : JSON.stringify(data);
      return new Blob([str]).size;
    } catch {
      return null;
    }
  }

  private buildConfig(apiConfig?: ApiConfig): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      ...apiConfig?.axios_config,
      headers: {
        ...(apiConfig?.axios_config?.headers ?? {}),
      },
    };

    if (apiConfig?.auth_token) {
      const type = apiConfig.auth_type ?? "Bearer";
      config.headers!["Authorization"] = `${type} ${apiConfig.auth_token}`;
    }

    if (apiConfig?.customHeaders) {
      config.headers = {
        ...config.headers,
        ...apiConfig.customHeaders,
      };
    }

    return config;
  }

  get<T>(url: string, apiConfig?: ApiConfig) {
    return this.client.get<T>(url, this.buildConfig(apiConfig));
  }

  post<T>(url: string, data?: any, apiConfig?: ApiConfig) {
    return this.client.post<T>(url, data, this.buildConfig(apiConfig));
  }

  put<T>(url: string, data?: any, apiConfig?: ApiConfig) {
    return this.client.put<T>(url, data, this.buildConfig(apiConfig));
  }

  delete<T>(url: string, apiConfig?: ApiConfig, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, this.buildConfig(apiConfig));
  }
}
