"use client";

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<Method, "success" | "primary" | "warning" | "info" | "error"> = {
    GET: "success",
    POST: "primary",
    PUT: "warning",
    PATCH: "info",
    DELETE: "error",
};

interface Header {
    key: string;
    value: string;
}

export default function ApiTesterPage() {
    const [method, setMethod] = useState<Method>("GET");
    const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
    const [headers, setHeaders] = useState<Header[]>([
        { key: "Content-Type", value: "application/json" },
    ]);
    const [body, setBody] = useState('{\n  "title": "hello",\n  "completed": false\n}');
    const [response, setResponse] = useState("");
    const [status, setStatus] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tab, setTab] = useState(0);

    const send = async () => {
        setLoading(true);
        setResponse("");
        setStatus(null);
        setElapsed(null);
        setError("");
        const start = performance.now();
        try {
            const hdrs: Record<string, string> = {};
            headers.forEach(({ key, value }) => {
                if (key.trim()) hdrs[key.trim()] = value.trim();
            });
            const opts: RequestInit = { method, headers: hdrs };
            if (!["GET", "DELETE"].includes(method) && body.trim()) opts.body = body;
            const res = await fetch(url, opts);
            const ms = Math.round(performance.now() - start);
            setElapsed(ms);
            setStatus(res.status);
            const ct = res.headers.get("content-type") || "";
            let text = await res.text();
            if (ct.includes("application/json")) {
                try { text = JSON.stringify(JSON.parse(text), null, 2); } catch { }
            }
            setResponse(text);
            setTab(2);
        } catch (e: unknown) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const addHeader = () =>
        setHeaders((h) => [...h, { key: "", value: "" }]);
    const removeHeader = (i: number) =>
        setHeaders((h) => h.filter((_, idx) => idx !== i));
    const updateHeader = (i: number, field: "key" | "value", val: string) =>
        setHeaders((h) => h.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

    const statusColor = (s: number): "success" | "warning" | "error" => {
        if (s < 300) return "success";
        if (s < 400) return "warning";
        return "error";
    };

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 120px)" gap={2}>
            {/* Header */}
            <Box>
                <Typography variant="h5" fontWeight={700}>
                    🚀 API Tester
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                    Send HTTP requests and inspect responses
                </Typography>
            </Box>

            <Divider />

            {/* URL bar */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                }}
            >
                <Select
                    size="small"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as Method)}
                    sx={{
                        minWidth: 110,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                    }}
                    renderValue={(val) => (
                        <Chip
                            label={val}
                            size="small"
                            color={METHOD_COLORS[val]}
                            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                    )}
                >
                    {METHODS.map((m) => (
                        <MenuItem key={m} value={m}>
                            <Chip label={m} size="small" color={METHOD_COLORS[m]} sx={{ fontWeight: 700, fontSize: "0.75rem" }} />
                        </MenuItem>
                    ))}
                </Select>

                <TextField
                    fullWidth
                    size="small"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="https://api.example.com/endpoint"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={send}
                    disabled={loading}
                    sx={{ whiteSpace: "nowrap", borderRadius: 2, px: 2.5 }}
                >
                    {loading ? "Sending..." : "Send"}
                </Button>
            </Paper>

            {/* Status row */}
            {(status !== null || elapsed !== null) && (
                <Stack direction="row" spacing={1} alignItems="center">
                    {status !== null && (
                        <Chip
                            label={`${status} ${statusLabel(status)}`}
                            color={statusColor(status)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    )}
                    {elapsed !== null && (
                        <Typography variant="caption" color="text.secondary">
                            ⏱ {elapsed} ms
                        </Typography>
                    )}
                </Stack>
            )}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
                    {error}
                </Alert>
            )}

            {/* Tabs */}
            <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        mb: 1.5,
                        "& .MuiTab-root": { fontSize: "0.8rem", minHeight: 40 },
                    }}
                >
                    <Tab label="Headers" />
                    <Tab label="Body" disabled={["GET", "DELETE"].includes(method)} />
                    <Tab label="Response" />
                </Tabs>

                {/* Headers tab */}
                {tab === 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {headers.map((h, i) => (
                            <Stack key={i} direction="row" spacing={1} alignItems="center">
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Header name"
                                    value={h.key}
                                    onChange={(e) => updateHeader(i, "key", e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Value"
                                    value={h.value}
                                    onChange={(e) => updateHeader(i, "value", e.target.value)}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                                <Tooltip title="Remove">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeHeader(i)}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        ))}
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addHeader}
                            size="small"
                            sx={{ width: "fit-content", borderRadius: 2, borderStyle: "dashed" }}
                        >
                            Add Header
                        </Button>
                    </Paper>
                )}

                {/* Body tab */}
                {tab === 1 && (
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            display: "flex",
                        }}
                    >
                        <Box
                            component="textarea"
                            value={body}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                            spellCheck={false}
                            placeholder='{ "key": "value" }'
                            sx={{
                                flex: 1,
                                p: 2,
                                border: "none",
                                outline: "none",
                                resize: "none",
                                fontFamily: "'Fira Code', monospace",
                                fontSize: "0.8rem",
                                lineHeight: 1.7,
                                bgcolor: "background.paper",
                                color: "text.primary",
                            }}
                        />
                    </Paper>
                )}

                {/* Response tab */}
                {tab === 2 && (
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            bgcolor: "#1e293b",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #334155",
                            minHeight: 0,
                        }}
                    >
                        <Box
                            px={2}
                            py={0.75}
                            bgcolor="#0f172a"
                            borderBottom="1px solid #334155"
                        >
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                                Response
                            </Typography>
                        </Box>
                        <Box
                            component="textarea"
                            value={response || (loading ? "Sending request..." : "Response will appear here after you click Send...")}
                            readOnly
                            sx={{
                                flex: 1,
                                p: 2,
                                border: "none",
                                outline: "none",
                                resize: "none",
                                fontFamily: "'Fira Code', monospace",
                                fontSize: "0.8rem",
                                lineHeight: 1.7,
                                bgcolor: "#1e293b",
                                color: "#e2e8f0",
                                overflowY: "auto",
                            }}
                        />
                    </Paper>
                )}
            </Box>
        </Box>
    );
}

function statusLabel(s: number): string {
    const labels: Record<number, string> = {
        200: "OK", 201: "Created", 204: "No Content",
        301: "Moved", 302: "Found", 304: "Not Modified",
        400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
        404: "Not Found", 405: "Method Not Allowed", 422: "Unprocessable",
        429: "Too Many Requests", 500: "Internal Server Error", 502: "Bad Gateway",
        503: "Unavailable",
    };
    return labels[s] ?? "";
}
