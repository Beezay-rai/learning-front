"use client";

import React, { useState, useSyncExternalStore, useCallback } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Badge,
    InputAdornment,
    LinearProgress,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    networkLogStore,
    type NetworkLogEntry,
} from "@/lib/networkLogStore";

// ─── Types ────────────────────────────────────────────────────────────

type MethodFilter = "ALL" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type StatusFilter = "ALL" | "2xx" | "3xx" | "4xx" | "5xx" | "ERR";

// ─── Helper fns ───────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
    GET: "#10b981",
    POST: "#3b82f6",
    PUT: "#f59e0b",
    PATCH: "#8b5cf6",
    DELETE: "#ef4444",
    OPTIONS: "#64748b",
    HEAD: "#64748b",
};

const SOURCE_COLORS: Record<string, string> = {
    "Core API": "#6366f1",
    "Identity Server": "#ec4899",
    "Gateway API": "#06b6d4",
    "Orchestrator API": "#f97316",
};

function statusColor(s: number | null): "success" | "warning" | "error" | "default" {
    if (s === null) return "default";
    if (s < 300) return "success";
    if (s < 400) return "warning";
    return "error";
}

function statusIcon(s: number | null) {
    if (s === null) return <InfoOutlinedIcon fontSize="small" sx={{ color: "#94a3b8" }} />;
    if (s < 300) return <CheckCircleOutlineIcon fontSize="small" sx={{ color: "#10b981" }} />;
    if (s < 400) return <WarningAmberIcon fontSize="small" sx={{ color: "#f59e0b" }} />;
    return <ErrorOutlineIcon fontSize="small" sx={{ color: "#ef4444" }} />;
}

function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms: number | null): string {
    if (ms === null) return "pending…";
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function tryPrettyJson(data: unknown): string {
    if (data === null || data === undefined) return "";
    if (typeof data === "string") {
        try {
            return JSON.stringify(JSON.parse(data), null, 2);
        } catch {
            return data;
        }
    }
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return String(data);
    }
}

// ─── Component ────────────────────────────────────────────────────────

export default function NetworkLogsPage() {
    // Subscribe to the global store using React 18's useSyncExternalStore
    const entries = useSyncExternalStore(
        networkLogStore.subscribe,
        networkLogStore.getEntries,
        networkLogStore.getEntries
    );

    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState(0);
    const [copied, setCopied] = useState(false);

    // ─── Filtering ──────────────────────────────────────────────────

    const filtered = entries.filter((e) => {
        const q = search.toLowerCase();
        if (
            q &&
            !e.url.toLowerCase().includes(q) &&
            !e.fullUrl.toLowerCase().includes(q) &&
            !e.method.toLowerCase().includes(q) &&
            !e.source.toLowerCase().includes(q)
        )
            return false;
        if (methodFilter !== "ALL" && e.method !== methodFilter) return false;
        if (statusFilter !== "ALL") {
            if (statusFilter === "ERR" && !e.error && (e.status === null || e.status < 400)) return false;
            if (statusFilter === "2xx" && (e.status === null || e.status < 200 || e.status >= 300)) return false;
            if (statusFilter === "3xx" && (e.status === null || e.status < 300 || e.status >= 400)) return false;
            if (statusFilter === "4xx" && (e.status === null || e.status < 400 || e.status >= 500)) return false;
            if (statusFilter === "5xx" && (e.status === null || e.status < 500 || e.status >= 600)) return false;
        }
        return true;
    });

    const selected = entries.find((e) => e.id === selectedId) || null;

    const handleClear = () => {
        networkLogStore.clear();
        setSelectedId(null);
    };

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const stats = {
        total: entries.length,
        success: entries.filter((e) => e.status !== null && e.status < 300).length,
        error: entries.filter((e) => (e.status !== null && e.status >= 400) || e.error).length,
        pending: entries.filter((e) => e.pending).length,
    };

    // ─── Render ─────────────────────────────────────────────────────

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 120px)" gap={1.5}>
            {/* Header */}
            <Box>
                <Typography variant="h5" fontWeight={700}>
                    🌐 Network Logs
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                    All API calls from your app are captured here automatically — browse any page and come back to inspect.
                </Typography>
            </Box>

            <Divider />

            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    flexWrap: "wrap",
                }}
            >
                {/* Clear */}
                <Tooltip title="Clear all logs">
                    <IconButton onClick={handleClear} size="small" color="default">
                        <DeleteSweepIcon />
                    </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem />

                {/* Search */}
                <TextField
                    size="small"
                    placeholder="Filter by URL, method, or source..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Divider orientation="vertical" flexItem />

                {/* Method filters */}
                <Stack direction="row" spacing={0.5}>
                    {(["ALL", "GET", "POST", "PUT", "DELETE"] as MethodFilter[]).map((m) => (
                        <Chip
                            key={m}
                            label={m}
                            size="small"
                            variant={methodFilter === m ? "filled" : "outlined"}
                            onClick={() => setMethodFilter(m)}
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                cursor: "pointer",
                                ...(m !== "ALL" && {
                                    color: methodFilter === m ? "#fff" : METHOD_COLORS[m],
                                    borderColor: METHOD_COLORS[m],
                                    bgcolor: methodFilter === m ? METHOD_COLORS[m] : "transparent",
                                }),
                            }}
                        />
                    ))}
                </Stack>

                <Divider orientation="vertical" flexItem />

                {/* Status filters */}
                <Stack direction="row" spacing={0.5}>
                    {(["ALL", "2xx", "3xx", "4xx", "5xx", "ERR"] as StatusFilter[]).map((s) => (
                        <Chip
                            key={s}
                            label={s}
                            size="small"
                            variant={statusFilter === s ? "filled" : "outlined"}
                            onClick={() => setStatusFilter(s)}
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.7rem",
                                cursor: "pointer",
                            }}
                        />
                    ))}
                </Stack>
            </Paper>

            {/* Stats bar */}
            <Stack direction="row" spacing={2} alignItems="center">
                <Badge color="primary" badgeContent={stats.total} max={9999}>
                    <Chip label="Total" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                </Badge>
                <Badge color="success" badgeContent={stats.success} max={9999}>
                    <Chip label="Success" size="small" variant="outlined" color="success" sx={{ fontWeight: 600 }} />
                </Badge>
                <Badge color="error" badgeContent={stats.error} max={9999}>
                    <Chip label="Errors" size="small" variant="outlined" color="error" sx={{ fontWeight: 600 }} />
                </Badge>
                {stats.pending > 0 && (
                    <Badge color="info" badgeContent={stats.pending}>
                        <Chip label="Pending" size="small" variant="outlined" color="info" sx={{ fontWeight: 600 }} />
                    </Badge>
                )}
                <Box flex={1} />
                <Typography variant="caption" color="text.secondary">
                    Logs are captured globally across all pages
                </Typography>
            </Stack>

            {/* Main content */}
            <Box flex={1} display="flex" gap={1.5} minHeight={0}>
                {/* Left: Entries list */}
                <Paper
                    elevation={0}
                    sx={{
                        flex: selected ? 1 : 1,
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        minWidth: 0,
                    }}
                >
                    {/* Column headers */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "50px 65px 130px 1fr 80px 80px 80px",
                            gap: 1,
                            px: 2,
                            py: 1,
                            bgcolor: "action.hover",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            minWidth: 640,
                        }}
                    >
                        <Typography variant="caption" fontWeight={700} color="text.secondary">#</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Method</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Source</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">URL</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Status</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Size</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Time</Typography>
                    </Box>

                    {/* Entries */}
                    <Box sx={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                        {filtered.length === 0 ? (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                gap={2}
                                p={4}
                            >
                                <NetworkCheckIcon sx={{ fontSize: 56, color: "text.disabled" }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    {entries.length === 0
                                        ? "No API calls captured yet."
                                        : "No requests match your filters."
                                    }
                                </Typography>
                                {entries.length === 0 && (
                                    <Typography variant="caption" color="text.disabled" textAlign="center">
                                        Browse other pages in the app and all API calls will appear here.
                                        <br />
                                        Calls to Core API, Identity Server, Gateway API, and Orchestrator API are captured automatically.
                                    </Typography>
                                )}
                                {entries.length === 0 && (
                                    <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
                                )}
                            </Box>
                        ) : (
                            filtered.map((entry, idx) => (
                                <Box
                                    key={entry.id}
                                    onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "50px 65px 130px 1fr 80px 80px 80px",
                                        gap: 1,
                                        px: 2,
                                        py: 0.75,
                                        cursor: "pointer",
                                        minWidth: 640,
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: selectedId === entry.id
                                            ? "action.selected"
                                            : entry.error
                                                ? "rgba(239,68,68,0.04)"
                                                : idx % 2 === 0
                                                    ? "transparent"
                                                    : "action.hover",
                                        "&:hover": {
                                            bgcolor: selectedId === entry.id ? "action.selected" : "action.hover",
                                        },
                                        transition: "background-color 0.15s",
                                    }}
                                >
                                    {/* # */}
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: "28px" }}>
                                        {filtered.length - idx}
                                    </Typography>
                                    {/* Method */}
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Chip
                                            label={entry.method}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "0.65rem",
                                                height: 22,
                                                bgcolor: METHOD_COLORS[entry.method] || "#64748b",
                                                color: "#fff",
                                            }}
                                        />
                                    </Box>
                                    {/* Source */}
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Chip
                                            label={entry.source}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: "0.6rem",
                                                height: 22,
                                                maxWidth: 120,
                                                borderColor: SOURCE_COLORS[entry.source] || "#94a3b8",
                                                color: SOURCE_COLORS[entry.source] || "#94a3b8",
                                            }}
                                        />
                                    </Box>
                                    {/* URL */}
                                    <Tooltip title={entry.fullUrl} placement="top-start">
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                lineHeight: "28px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                fontFamily: "'Fira Code', monospace",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            {entry.url}
                                        </Typography>
                                    </Tooltip>
                                    {/* Status */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        {entry.pending ? (
                                            <Chip label="pending" size="small" variant="outlined" color="info" sx={{ fontWeight: 600, fontSize: "0.65rem", height: 22 }} />
                                        ) : entry.error ? (
                                            <Chip label="ERR" size="small" color="error" sx={{ fontWeight: 700, fontSize: "0.65rem", height: 22 }} />
                                        ) : (
                                            <Chip
                                                label={entry.status}
                                                size="small"
                                                color={statusColor(entry.status)}
                                                variant="outlined"
                                                sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                                            />
                                        )}
                                    </Box>
                                    {/* Size */}
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: "28px", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem" }}>
                                        {formatBytes(entry.size)}
                                    </Typography>
                                    {/* Duration */}
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            lineHeight: "28px",
                                            fontFamily: "'Fira Code', monospace",
                                            fontSize: "0.7rem",
                                            color: (entry.duration ?? 0) > 1000 ? "warning.main" : "text.secondary",
                                        }}
                                    >
                                        {formatDuration(entry.duration)}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Paper>

                {/* Right: Detail Panel */}
                {selected && (
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            minWidth: 0,
                        }}
                    >
                        {/* Detail header */}
                        <Box
                            px={2}
                            py={1}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            borderBottom="1px solid"
                            borderColor="divider"
                            bgcolor="action.hover"
                        >
                            {statusIcon(selected.status)}
                            <Chip
                                label={selected.method}
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.7rem",
                                    bgcolor: METHOD_COLORS[selected.method] || "#64748b",
                                    color: "#fff",
                                }}
                            />
                            <Tooltip title={selected.fullUrl}>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{
                                        flex: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontFamily: "'Fira Code', monospace",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {selected.fullUrl}
                                </Typography>
                            </Tooltip>
                            {selected.status !== null && (
                                <Chip
                                    label={`${selected.status} ${selected.statusText}`}
                                    size="small"
                                    color={statusColor(selected.status)}
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                />
                            )}
                            <IconButton size="small" onClick={() => setSelectedId(null)}>
                                <ExpandLessIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* General Info */}
                        <Box px={2} py={1} borderBottom="1px solid" borderColor="divider" sx={{ bgcolor: "background.default" }}>
                            <Stack direction="row" spacing={3} flexWrap="wrap" rowGap={1}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Source</Typography>
                                    <Typography variant="caption" display="block" fontWeight={600} sx={{ color: SOURCE_COLORS[selected.source] || "text.primary" }}>
                                        {selected.source}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Time</Typography>
                                    <Typography variant="caption" display="block" fontFamily="'Fira Code', monospace" fontSize="0.75rem">
                                        {formatTime(selected.startTime)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Duration</Typography>
                                    <Typography variant="caption" display="block" fontFamily="'Fira Code', monospace" fontSize="0.75rem">
                                        {formatDuration(selected.duration)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Size</Typography>
                                    <Typography variant="caption" display="block" fontFamily="'Fira Code', monospace" fontSize="0.75rem">
                                        {formatBytes(selected.size)}
                                    </Typography>
                                </Box>
                                {selected.error && (
                                    <Box>
                                        <Typography variant="caption" color="error.main" fontWeight={600}>Error</Typography>
                                        <Typography variant="caption" display="block" color="error.main" fontFamily="'Fira Code', monospace" fontSize="0.75rem">
                                            {selected.error}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>

                        {/* Tabs */}
                        <Tabs
                            value={detailTab}
                            onChange={(_, v) => setDetailTab(v)}
                            sx={{
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                minHeight: 36,
                                "& .MuiTab-root": { fontSize: "0.8rem", minHeight: 36, py: 0 },
                            }}
                        >
                            <Tab
                                label={
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                                        <span>Request Headers</span>
                                    </Stack>
                                }
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                                        <span>Request Body</span>
                                    </Stack>
                                }
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                        <span>Response Headers</span>
                                    </Stack>
                                }
                            />
                            <Tab
                                label={
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                        <span>Response Body</span>
                                    </Stack>
                                }
                            />
                        </Tabs>

                        {/* Tab content */}
                        <Box flex={1} overflow="auto" position="relative">
                            {/* Request Headers */}
                            {detailTab === 0 && (
                                <HeadersTable
                                    headers={selected.requestHeaders}
                                    onCopy={handleCopy}
                                    label="Request Headers"
                                    emptyMessage="No request headers captured"
                                />
                            )}

                            {/* Request Body */}
                            {detailTab === 1 && (
                                <CodeBlock
                                    content={tryPrettyJson(selected.requestBody)}
                                    onCopy={handleCopy}
                                    emptyMessage="No request body"
                                />
                            )}

                            {/* Response Headers */}
                            {detailTab === 2 && (
                                <HeadersTable
                                    headers={selected.responseHeaders}
                                    onCopy={handleCopy}
                                    label="Response Headers"
                                    emptyMessage={selected.pending ? "Waiting for response..." : "No response headers captured"}
                                />
                            )}

                            {/* Response Body */}
                            {detailTab === 3 && (
                                <CodeBlock
                                    content={selected.error ? `Error: ${selected.error}` : tryPrettyJson(selected.responseBody)}
                                    onCopy={handleCopy}
                                    emptyMessage={selected.pending ? "Waiting for response..." : "No response body"}
                                    isError={!!selected.error}
                                />
                            )}
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* Copy toast */}
            {copied && (
                <Alert
                    severity="success"
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        borderRadius: 2,
                        zIndex: 9999,
                        boxShadow: 6,
                    }}
                >
                    Copied to clipboard!
                </Alert>
            )}
        </Box>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────

function HeadersTable({
    headers,
    onCopy,
    label,
    emptyMessage,
}: {
    headers: Record<string, string>;
    onCopy: (text: string) => void;
    label: string;
    emptyMessage: string;
}) {
    const entries = Object.entries(headers);

    if (entries.length === 0) {
        return (
            <Box p={3} display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
            </Box>
        );
    }

    return (
        <Box p={0}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                px={2}
                py={1}
                bgcolor="action.hover"
                borderBottom="1px solid"
                borderColor="divider"
            >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {label} ({entries.length})
                </Typography>
                <Tooltip title="Copy all as JSON">
                    <IconButton size="small" onClick={() => onCopy(JSON.stringify(headers, null, 2))}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            {entries.map(([key, value]) => (
                <Box
                    key={key}
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "200px 1fr",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background-color 0.15s",
                    }}
                >
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{
                            px: 2,
                            py: 0.75,
                            color: "primary.main",
                            fontFamily: "'Fira Code', monospace",
                            fontSize: "0.75rem",
                            borderRight: "1px solid",
                            borderColor: "divider",
                            wordBreak: "break-all",
                        }}
                    >
                        {key}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 2,
                            py: 0.75,
                            fontFamily: "'Fira Code', monospace",
                            fontSize: "0.75rem",
                            wordBreak: "break-all",
                            color: "text.primary",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

function CodeBlock({
    content,
    onCopy,
    emptyMessage,
    isError,
}: {
    content: string;
    onCopy: (text: string) => void;
    emptyMessage: string;
    isError?: boolean;
}) {
    if (!content) {
        return (
            <Box p={3} display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box
                display="flex"
                justifyContent="flex-end"
                px={2}
                py={0.5}
                bgcolor="#0f172a"
                borderBottom="1px solid #334155"
            >
                <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => onCopy(content)} sx={{ color: "#94a3b8" }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box
                component="pre"
                sx={{
                    flex: 1,
                    m: 0,
                    p: 2,
                    bgcolor: "#1e293b",
                    color: isError ? "#fca5a5" : "#e2e8f0",
                    fontFamily: "'Fira Code', monospace",
                    fontSize: "0.8rem",
                    lineHeight: 1.7,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                }}
            >
                {content}
            </Box>
        </Box>
    );
}
