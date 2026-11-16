import axios from "axios";

const webSocketClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_WEB_SOCKET_URL_DEV || "http://localhost:5175",
  // headers: {
  //   origin: "http://localhost:3000",
  // },
});
