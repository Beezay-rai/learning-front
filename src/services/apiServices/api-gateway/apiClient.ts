import axios from "axios";

const myApiClient = axios.create({
  baseURL: process.env.API_GATEWAY_URL_DEV || "http://localhost:5274/api",
  // headers: {
  //   origin: "http://localhost:3000",
  // },
});

const myIdentityClient = axios.create({
  baseURL: process.env.IDENTITY_SERVER_URL_DEV || "http://localhost:5001",
  headers: {
    origin: "http://localhost:3000",
  },
});

export default myApiClient;
