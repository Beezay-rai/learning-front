"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";

export default function JwtInspectorPage() {
  const [token, setToken] = useState<string>("");
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const theme = useTheme();

  const decodeBase64Url = (str: string) => {
    try {
      // Convert Base64Url to standard Base64
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      // Pad with '=' so length is a multiple of 4
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error("Invalid base64 string.");
        }
        base64 += new Array(5 - pad).join("=");
      }
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!token.trim()) {
      setHeader(null);
      setPayload(null);
      setSignature("");
      setIsValid(null);
      return;
    }

    const parts = token.split(".");

    if (parts.length >= 2) {
      const decodedHeaderStr = decodeBase64Url(parts[0]);
      const decodedPayloadStr = decodeBase64Url(parts[1]);

      try {
        if (decodedHeaderStr) setHeader(JSON.parse(decodedHeaderStr));
        else setHeader(null);
      } catch (e) {
        setHeader(null);
      }

      try {
        if (decodedPayloadStr) setPayload(JSON.parse(decodedPayloadStr));
        else setPayload(null);
      } catch (e) {
        setPayload(null);
      }

      if (parts.length === 3) {
        setSignature(parts[2]);
        setIsValid(true);
      } else {
        setSignature("");
        setIsValid(false);
      }
    } else {
      setHeader(null);
      setPayload(null);
      setSignature("");
      setIsValid(false);
    }
  }, [token]);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          🔑 JWT Inspector
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={0.5}>
          Decode, verify, and inspect JSON Web Tokens (JWT).
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left side: Encoded token */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Encoded Token
          </Typography>
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              height: "100%",
              minHeight: 450,
            }}
          >
            <CardContent
              sx={{ height: "100%", p: 0, "&:last-child": { pb: 0 } }}
            >
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste a token here..."
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "450px",
                  border: "none",
                  padding: "24px",
                  resize: "none",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#121212" : "#fafafa",
                  color: theme.palette.text.primary,
                  outline: "none",
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right side: Decoded sections */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Decoded Info
          </Typography>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* HEADER */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor:
                  isValid === false && header === null
                    ? "error.main"
                    : "#fb7185",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                px={3}
                py={1.5}
                bgcolor={
                  isValid === false && header === null
                    ? "error.light"
                    : "#ffe4e6"
                }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  color="#e11d48"
                  fontWeight={700}
                >
                  HEADER: ALGORITHM & TOKEN TYPE
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "#fb7185" }} />
              <Box
                p={3}
                bgcolor={theme.palette.mode === "dark" ? "#1e1b1e" : "#fff1f2"}
              >
                {header ? (
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "monospace",
                      color:
                        theme.palette.mode === "dark" ? "#fda4af" : "#be123c",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(header, null, 2)}
                  </pre>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    Data will appear here
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* PAYLOAD */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor:
                  isValid === false && payload === null
                    ? "error.main"
                    : "#c084fc",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                px={3}
                py={1.5}
                bgcolor={
                  isValid === false && payload === null
                    ? "error.light"
                    : "#f3e8ff"
                }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  color="#9333ea"
                  fontWeight={700}
                >
                  PAYLOAD: DATA
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "#c084fc" }} />
              <Box
                p={3}
                bgcolor={theme.palette.mode === "dark" ? "#211a26" : "#faf5ff"}
              >
                {payload ? (
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "monospace",
                      color:
                        theme.palette.mode === "dark" ? "#d8b4fe" : "#7e22ce",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    Data will appear here
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* SIGNATURE */}
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: isValid === false ? "error.main" : "#60a5fa",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                px={3}
                py={1.5}
                bgcolor={isValid === false ? "error.light" : "#dbeafe"}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  color="#2563eb"
                  fontWeight={700}
                >
                  VERIFY SIGNATURE
                </Typography>
                {isValid === true && (
                  <Chip
                    label="Valid format"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                )}
                {isValid === false && token.length > 0 && (
                  <Chip
                    label="Invalid signature"
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                )}
              </Box>
              <Divider sx={{ borderColor: "#60a5fa" }} />
              <Box
                p={3}
                bgcolor={theme.palette.mode === "dark" ? "#1a1f2c" : "#eff6ff"}
              >
                {signature ? (
                  <Typography
                    sx={{
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      color:
                        theme.palette.mode === "dark" ? "#93c5fd" : "#1d4ed8",
                      fontSize: "0.9rem",
                    }}
                  >
                    {signature}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    Signature data
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
