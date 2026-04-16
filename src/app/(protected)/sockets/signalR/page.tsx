"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  MenuItem,
  IconButton,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useSignalR from "@/hooks/useSignalR";

export default function SignalRPage() {
  const [url, setUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authType, setAuthType] = useState<"none" | "Basic" | "Bearer">("none");
  const [message, setMessage] = useState("");
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isConnecting,
    receivedMessages,
    connect,
    disconnect,
    sendMessage,
  } = useSignalR({
    url,
    config: {
      authType,
      authValue: authToken,
      headers: headers
        .filter((h) => h.key.trim())
        .reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
    },
  });

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

  const handleHeaderChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  const addHeaderField = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeaderField = (index: number) => {
    const updated = headers.filter((_, i) => i !== index);
    setHeaders(updated.length ? updated : [{ key: "", value: "" }]);
  };

  const currentUser = "You";

  return (
    <Paper elevation={5} sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
        SignalR Live Chat
      </Typography>

      {/* Connection Status */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mb={2}
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

      {/* Connection Settings */}
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Grid container spacing={4}>
          <Grid
            size={{
              md: 12,
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
          </Grid>

          <Grid
            size={{
              md: 2,
            }}
          >
            <TextField
              select
              label="Auth Type"
              fullWidth
              size="small"
              value={authType}
              onChange={(e) => setAuthType(e.target.value as any)}
              disabled={isConnected}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="Basic">Basic</MenuItem>
              <MenuItem value="Bearer">Bearer</MenuItem>
            </TextField>
          </Grid>

          <Grid
            size={{
              md: 10,
            }}
          >
            {authType !== "none" && (
              <TextField
                label={`${authType} Token`}
                size="small"
                fullWidth
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                disabled={isConnected}
                placeholder={`Enter ${authType} token`}
              />
            )}
          </Grid>
        </Grid>

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" mb={1}>
              Custom Headers
            </Typography>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addHeaderField}
              size="small"
              variant="outlined"
              disabled={isConnected}
            >
              Add Header
            </Button>
          </Box>

          <Stack spacing={1}>
            {headers.map((h, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Key"
                  value={h.key}
                  onChange={(e) => handleHeaderChange(i, "key", e.target.value)}
                  sx={{ flex: 1 }}
                  disabled={isConnected}
                />
                <TextField
                  size="small"
                  label="Value"
                  value={h.value}
                  onChange={(e) =>
                    handleHeaderChange(i, "value", e.target.value)
                  }
                  sx={{ flex: 1 }}
                  disabled={isConnected}
                />
                <IconButton
                  onClick={() => removeHeaderField(i)}
                  disabled={isConnected}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Connect / Disconnect */}
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

          <Box
            sx={{
              height: 320,
              overflowY: "auto",
              p: 1,
              mb: 2,
              borderRadius: 3,
              bgcolor: "grey.300",
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
              sx={{ borderRadius: 3, minWidth: 56, height: 40 }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </Button>
          </Stack>
        </>
      )}
    </Paper>
  );
}
