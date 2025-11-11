import axios from "axios";

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

export default coreApiClient;
