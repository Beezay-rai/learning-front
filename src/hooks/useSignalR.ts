import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";

function useSignalR(url: string) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  const connect = useCallback(async () => {
    if (!url.trim()) return;

    setIsConnecting(true);
    try {
      const newConnection = new HubConnectionBuilder()
        .withUrl(url)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      newConnection.on("ReceiveMessage", (user: string, msg: string) => {
        setReceivedMessages((prev) => [...prev, `${user}: ${msg}`]);
      });

      await newConnection.start();
      connectionRef.current = newConnection;
      setConnection(newConnection);
      setIsConnected(true);
      console.log("SignalR Connected");
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect. Check URL and server status.");
    } finally {
      setIsConnecting(false);
    }
  }, [url]);

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        console.log("SignalR Disconnected");
      } catch (err) {
        console.error("Disconnect error:", err);
      } finally {
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
        setReceivedMessages([]);
      }
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!connectionRef.current || !message.trim()) return;
    try {
      await connectionRef.current.invoke("SendMessage", message);
    } catch (err) {
      console.error("Send failed:", err);
    }
  }, []);

  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    receivedMessages,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useSignalR;
