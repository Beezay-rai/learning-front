// lib/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "@/common/store/store";

export interface ApiClientOptions {
  baseURL: string;
}

export interface ApiConfig {
  auth_type?: "Bearer" | "Custom";
  auth_token?: string;
  customHeaders?: Record<string, string>;
  axios_config?: AxiosRequestConfig;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(options: ApiClientOptions) {
    this.client = axios.create({
      baseURL: options.baseURL,
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const customError: any = {
          message:
            error.response?.data?.message ||
            error.message ||
            "Something went wrong",
          status: error.response?.status,
          data: error.response?.data,
        };

        switch (customError.status) {
          case 401:
            console.log("Unauthorized! redirect to login");
            break;
          case 403:
            console.log("Forbidden! show forbidden component");
            break;
          case 500:
            console.log("Server error! show server error component");
            break;
        }

        return Promise.reject(customError);
      }
    );
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

  post<T>(
    url: string,
    data?: any,
    apiConfig?: ApiConfig,
    config?: AxiosRequestConfig
  ) {
    return this.client.post<T>(url, data, this.buildConfig(apiConfig));
  }

  put<T>(
    url: string,
    data?: any,
    apiConfig?: ApiConfig,
    config?: AxiosRequestConfig
  ) {
    return this.client.put<T>(url, data, this.buildConfig(apiConfig));
  }

  delete<T>(url: string, apiConfig?: ApiConfig, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, this.buildConfig(apiConfig));
  }
}
