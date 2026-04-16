import { useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

interface SignalRParams {
  url: string;
  config?: {
    authType?: "none" | "Bearer" | "Basic";
    authValue?: string;
    headers?: signalR.MessageHeaders;
  };
}

export default function useSignalR(params: SignalRParams) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  const connect = async () => {
    if (!params.url) return;

    setIsConnecting(true);
    try {
      let signalRConfig: signalR.IHttpConnectionOptions = {
        headers: params.config?.headers,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      };

      params.config?.authType === "Basic"
        ? (signalRConfig.headers = {
            ...signalRConfig.headers,
            Authorization: params.config?.authValue ?? "",
          })
        : params.config?.authType === "Bearer"
        ? (signalRConfig.accessTokenFactory = () =>
            params.config?.authValue ?? "")
        : null;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(params.url, signalRConfig)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (user, message) => {
        setReceivedMessages((prev) => [...prev, `${user}: ${message}`]);
      });

      await connection.start();
      connectionRef.current = connection;
      setIsConnected(true);
    } catch (error) {
      console.error("SignalR connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (connectionRef.current && isConnected) {
      await connectionRef.current.invoke("SendMessage", message);
    }
  };

  return {
    isConnected,
    isConnecting,
    receivedMessages,
    connect,
    disconnect,
    sendMessage,
  };
}
