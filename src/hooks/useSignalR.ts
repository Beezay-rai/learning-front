import { useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export default function useSignalR(
  url: string,
  config?: { authType?: "none" | "bearer" | "basic"; authValue?: string }
) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  const connect = async () => {
    if (!url) return;

    setIsConnecting(true);

    try {
      // let connectionOptions: signalR.IHttpConnectionOptions = {
      //   transport:
      //     signalR.HttpTransportType.WebSockets |
      //     signalR.HttpTransportType.LongPolling,
      // };

      // if (config?.authType === "bearer") {
      //   connectionOptions = {
      //     ...connectionOptions,
      //     accessTokenFactory: () => config.authValue ?? "",
      //   };
      // } else if (config?.authType === "basic" && config.authValue) {
      //   const encoded = btoa(config.authValue);
      //   connectionOptions = {
      //     transport: signalR.HttpTransportType.LongPolling, // force fallback
      //     headers: {
      //       Authorization: `Basic ${encoded}`,
      //     },
      //   };
      // }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
          accessTokenFactory: () => config?.authValue ?? "",
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.LongPolling,
        })
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
