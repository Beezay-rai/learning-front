"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Typography,
  Divider,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { XMLParser, XMLBuilder } from "fast-xml-parser";

interface KVRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface SoapOperation {
  name: string;
  input: string;
  output: string;
}

export default function SoapTester() {
  const [wsdlUrl, setWsdlUrl] = useState(
    "https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL"
  );
  const [loadingWsdl, setLoadingWsdl] = useState(false);
  const [wsdlError, setWsdlError] = useState("");
  const [operations, setOperations] = useState<SoapOperation[]>([]);
  const [selectedOp, setSelectedOp] = useState("");

  const [endpoint, setEndpoint] = useState("");
  const [soapAction, setSoapAction] = useState("");
  const [envelope, setEnvelope] =
    useState(`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://www.dataaccess.com/webservicesserver/">
  <soap:Header/>
  <soap:Body>
    <web:NumberToWords>
      <web:ubiNum>42</web:ubiNum>
    </web:NumberToWords>
  </soap:Body>
</soap:Envelope>`);

  const [headers, setHeaders] = useState<KVRow[]>([
    {
      id: "1",
      key: "Content-Type",
      value: "text/xml; charset=utf-8",
      enabled: true,
    },
    { id: "2", key: "SOAPAction", value: "", enabled: true },
  ]);

  const [response, setResponse] = useState<string>("");
  const [resStatus, setResStatus] = useState<number>(0);
  const [resTime, setResTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // --- Load WSDL ---
  const loadWsdl = useCallback(async () => {
    setLoadingWsdl(true);
    setWsdlError("");
    setOperations([]);
    setSelectedOp("");

    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(wsdlUrl)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const json = parser.parse(text);

      const definitions = json["wsdl:definitions"];
      if (!definitions) throw new Error("Invalid WSDL");

      // Extract endpoint
      const service = definitions["wsdl:service"];
      const port = Array.isArray(service["wsdl:port"])
        ? service["wsdl:port"][0]
        : service["wsdl:port"];
      const location =
        port?.["soap:address"]?.["@_location"] ||
        port?.["soap12:address"]?.["@_location"];
      setEndpoint(location || "");

      // Extract operations
      const portType = definitions["wsdl:portType"];
      const ops = Array.isArray(portType["wsdl:operation"])
        ? portType["wsdl:operation"]
        : [portType["wsdl:operation"]];

      const opsList: SoapOperation[] = ops.map((op: any) => ({
        name: op["@_name"],
        input: op["wsdl:input"]?.["@_message"]?.split(":").pop() || "",
        output: op["wsdl:output"]?.["@_message"]?.split(":").pop() || "",
      }));

      setOperations(opsList);
      if (opsList.length > 0) {
        setSelectedOp(opsList[0].name);
      }
    } catch (err: any) {
      setWsdlError(err.message || "Failed to load WSDL");
    } finally {
      setLoadingWsdl(false);
    }
  }, [wsdlUrl]);

  // Auto-fill SOAPAction when operation changes
  useMemo(() => {
    if (!selectedOp) return;
    const op = operations.find((o) => o.name === selectedOp);
    if (op) {
      const action = `"${endpoint
        .split("/")
        .slice(0, -1)
        .join("/")}/${selectedOp}"`;
      setSoapAction(action);
      setHeaders((prev) =>
        prev.map((h) => (h.key === "SOAPAction" ? { ...h, value: action } : h))
      );
    }
  }, [selectedOp, operations, endpoint]);

  // --- Send SOAP Request ---
  const sendRequest = useCallback(async () => {
    if (!endpoint) {
      alert("Load WSDL first to get endpoint");
      return;
    }

    setLoading(true);
    setResponse("");
    const start = performance.now();

    const reqHeaders: Record<string, string> = {};
    headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        reqHeaders[h.key.trim()] = h.value.trim();
      });

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: reqHeaders,
        body: envelope,
      });

      const text = await res.text();
      const end = performance.now();

      const builder = new XMLBuilder({
        format: true,
        ignoreAttributes: false,
      });
      let pretty = text;
      try {
        const json = new XMLParser().parse(text);
        pretty = builder.build(json);
      } catch {
        // keep raw
      }

      setResponse(pretty);
      setResStatus(res.status);
      setResTime(Math.round(end - start));
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
      setResStatus(0);
      setResTime(Math.round(performance.now() - start));
    } finally {
      setLoading(false);
    }
  }, [endpoint, headers, envelope]);

  // --- Helpers ---
  const addHeader = () => {
    setHeaders((prev) => [
      ...prev,
      { id: Date.now().toString(), key: "", value: "", enabled: true },
    ]);
  };

  const updateHeader = (
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const deleteHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* --- WSDL Loader --- */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#fff",
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="WSDL URL"
          value={wsdlUrl}
          onChange={(e) => setWsdlUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadWsdl()}
        />
        <Button
          variant="contained"
          onClick={loadWsdl}
          disabled={loadingWsdl}
          startIcon={loadingWsdl ? <CircularProgress size={16} /> : null}
        >
          Load WSDL
        </Button>
      </Box>

      {wsdlError && (
        <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
          {wsdlError}
        </Alert>
      )}

      {operations.length > 0 && (
        <Box sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid #eee" }}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Operation</InputLabel>
                <Select
                  value={selectedOp}
                  label="Operation"
                  onChange={(e) => setSelectedOp(e.target.value)}
                >
                  {operations.map((op) => (
                    <MenuItem key={op.name} value={op.name}>
                      {op.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                size="small"
                label="Endpoint"
                value={endpoint}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      <Divider />

      {/* --- Tabs --- */}
      <Tabs value={0} sx={{ bgcolor: "#fafafa" }}>
        <Tab label="Request" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {/* --- Headers --- */}
        <Typography variant="subtitle2" gutterBottom>
          Headers
        </Typography>
        <TableContainer sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={40}></TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {headers.map((row) => (
                <TableRow key={row.id}>
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) =>
                        updateHeader(row.id, "enabled", e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={row.key}
                      onChange={(e) =>
                        updateHeader(row.id, "key", e.target.value)
                      }
                      disabled={!row.enabled}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={row.value}
                      onChange={(e) =>
                        updateHeader(row.id, "value", e.target.value)
                      }
                      disabled={!row.enabled}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => deleteHeader(row.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            startIcon={<AddIcon />}
            onClick={addHeader}
            size="small"
            sx={{ mt: 1 }}
          >
            Add Header
          </Button>
        </TableContainer>

        {/* --- SOAP Envelope --- */}
        <Typography variant="subtitle2" gutterBottom>
          SOAP Envelope
        </Typography>
        <Paper variant="outlined" sx={{ p: 1, bgcolor: "#fff" }}>
          <CodeMirror
            value={envelope}
            height="300px"
            extensions={[xml()]}
            theme={oneDark}
            onChange={(val) => setEnvelope(val)}
          />
        </Paper>

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={sendRequest}
            disabled={loading || !endpoint}
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* --- Response --- */}
      <Box sx={{ p: 2, bgcolor: "#fafafa" }}>
        <Typography variant="subtitle1" gutterBottom>
          Response
        </Typography>

        {response ? (
          <Stack spacing={1}>
            <Grid container spacing={1} alignItems="center">
              <Grid>
                <Chip
                  label={resStatus}
                  color={
                    resStatus >= 200 && resStatus < 300 ? "success" : "error"
                  }
                  size="small"
                />
              </Grid>
              <Grid>
                <Chip label={`${resTime} ms`} size="small" />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 1, bgcolor: "#fff", mt: 1 }}>
              <CodeMirror
                value={response}
                height="300px"
                extensions={[xml()]}
                theme={oneDark}
                readOnly
              />
            </Paper>
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
            {loading
              ? "Waiting for response..."
              : "Send a request to see the response"}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
