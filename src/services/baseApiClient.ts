import { store } from "@/common/store/store";
import axios, { AxiosRequestConfig } from "axios";

const idsrvApiClient = axios.create({
  // baseURL: "http://localhost:5196/api",
  baseURL:
    (process.env.IDENTITY_SERVER_URL_DEV || "https://localhost:5082") + "/api",
});

idsrvApiClient.interceptors.request.use((config) => {
  const token = store.getState().userDetail.oidc_user?.access_token;

  if (token && config.headers) {
    // Use .set() instead of assigning a plain object
    (config.headers as any).Authorization = `Bearer ${token}`;
    // OR, if using AxiosHeaders type:
    // config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

idsrvApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customError: any = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

const coreApiClient = axios.create({
  // baseURL: "http://localhost:5196/api",
  baseURL: (process.env.CORE_URL_DEV || "http://localhost:5196") + "/api/v1",
});

coreApiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const customError: any = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);
const myApiClient = axios.create({
  baseURL: process.env.API_GATEWAY_URL_DEV || "http://localhost:5274/api",
  // headers: {
  //   origin: "http://localhost:3000",
  // },
});
