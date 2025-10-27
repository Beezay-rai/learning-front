"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import useSignalR from "@/hooks/useSignalR";

export default function SignalRPage() {
  const [url, setUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [message, setMessage] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isConnecting,
    receivedMessages,
    connect,
    disconnect,
    sendMessage,
  } = useSignalR(url);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [receivedMessages]);

  const handleSend = useCallback(() => {
    if (message.trim() && isConnected) {
      sendMessage(message);
      setMessage("");
      messageInputRef.current?.focus();
    }
  }, [message, isConnected, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentUser = "You";

  return (
    <Paper elevation={5}>
      <Typography variant="h5" fontWeight="bold" textAlign="center">
        SignalR Live Chat
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mt={1}
      >
        {isConnected ? (
          <>
            <WifiIcon
              sx={{
                fontSize: 18,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
            <Typography variant="body2">Connected</Typography>
          </>
        ) : (
          <>
            <WifiOffIcon sx={{ fontSize: 18, color: "red" }} />
            <Typography variant="body2">Disconnected</Typography>
          </>
        )}
      </Stack>

      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            gap: 2,
          }}
        >
          <TextField
            label="SignalR Hub URL"
            size="small"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="wss://yoursignalr.com/chatHub"
            disabled={isConnected || isConnecting}
          />

          {!isConnected ? (
            <Button
              variant="contained"
              fullWidth
              onClick={connect}
              disabled={!url.trim() || isConnecting}
              startIcon={isConnecting ? <CircularProgress size={20} /> : null}
            >
              {isConnecting ? "Connecting..." : "Connect to Hub"}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              color="error"
              onClick={disconnect}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                py: 1.5,
              }}
            >
              Disconnect
            </Button>
          )}
        </Box>

        {isConnected && (
          <>
            <Divider sx={{ mb: 2 }} />

            {/* Messages */}
            <Box
              sx={{
                height: 320,
                overflowY: "auto",
                p: 1,
                mb: 2,
                borderRadius: 3,
                bgcolor: "grey.100",
                "&::-webkit-scrollbar": {
                  width: 6,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "grey.400",
                  borderRadius: 3,
                },
              }}
            >
              {receivedMessages.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 10, fontStyle: "italic" }}
                >
                  No messages yet. Say hello!
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {receivedMessages.map((msg, i) => {
                    const [user, text] = msg.split(": ");
                    const isMe = user === currentUser;

                    return (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            maxWidth: "75%",
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: isMe ? "primary.main" : "background.paper",
                            color: isMe ? "white" : "text.primary",
                            borderBottomRightRadius: isMe ? 0 : 3,
                            borderBottomLeftRadius: isMe ? 3 : 0,
                          }}
                        >
                          {!isMe && (
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              display="block"
                              sx={{ opacity: 0.8, mb: 0.5 }}
                            >
                              {user}
                            </Typography>
                          )}
                          <Typography variant="body2">{text}</Typography>
                        </Paper>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>

            {/* Input */}
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Type a message..."
                size="small"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                inputRef={messageInputRef}
                autoFocus
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!message.trim()}
                sx={{
                  borderRadius: 3,
                  minWidth: 56,
                  height: 40,
                }}
              >
                <SendIcon sx={{ fontSize: 20 }} />
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  );
}
