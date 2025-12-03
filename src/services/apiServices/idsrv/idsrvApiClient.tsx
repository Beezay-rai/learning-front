import axios from "axios";

const idsrvApiClient = axios.create({
  // baseURL: "http://localhost:5196/api",
  baseURL:
    (process.env.IDENTITY_SERVER_URL_DEV || "https://localhost:5082") + "/api",
});

idsrvApiClient.interceptors.response.use(
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

export default idsrvApiClient;
