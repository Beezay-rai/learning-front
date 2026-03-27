"use client";

import React, { useState, useSyncExternalStore, useRef, useCallback, useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    Fab,
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
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import {
    networkLogStore,
    type NetworkLogEntry,
} from "@/lib/networkLogStore";

// ─── Helpers ──────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
    GET: "#10b981", POST: "#3b82f6", PUT: "#f59e0b",
    PATCH: "#8b5cf6", DELETE: "#ef4444", OPTIONS: "#64748b",
};

const SOURCE_COLORS: Record<string, string> = {
    "Core API": "#6366f1", "Identity Server": "#ec4899",
    "Gateway API": "#06b6d4", "Orchestrator API": "#f97316",
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
        hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
}

function tryPrettyJson(data: unknown): string {
    if (data === null || data === undefined) return "";
    if (typeof data === "string") {
        try { return JSON.stringify(JSON.parse(data), null, 2); } catch { return data; }
    }
    try { return JSON.stringify(data, null, 2); } catch { return String(data); }
}

type MethodFilter = "ALL" | "GET" | "POST" | "PUT" | "DELETE";
type StatusFilter = "ALL" | "2xx" | "3xx" | "4xx" | "5xx" | "ERR";

// ─── Main Exported Component ──────────────────────────────────────────

export default function NetworkLogPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [panelHeight, setPanelHeight] = useState(380);
    const isDragging = useRef(false);
    const dragStartY = useRef(0);
    const dragStartHeight = useRef(0);

    // Drag to resize
    const handleDragStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        dragStartY.current = e.clientY;
        dragStartHeight.current = panelHeight;

        const handleMove = (ev: MouseEvent) => {
            if (!isDragging.current) return;
            const delta = dragStartY.current - ev.clientY;
            const newHeight = Math.max(200, Math.min(window.innerHeight - 80, dragStartHeight.current + delta));
            setPanelHeight(newHeight);
        };
        const handleUp = () => {
            isDragging.current = false;
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleUp);
        };
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleUp);
    }, [panelHeight]);

    const entries = useSyncExternalStore(
        networkLogStore.subscribe,
        networkLogStore.getEntries,
        networkLogStore.getEntries
    );

    const errorCount = entries.filter((e) => (e.status !== null && e.status >= 400) || e.error).length;

    return (
        <>
            {/* ── FAB Toggle ─────────────────────────────────── */}
            <Tooltip title={isOpen ? "Close Network Logs" : "Open Network Logs"} placement="left">
                <Fab
                    size="medium"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: "fixed",
                        bottom: isOpen ? panelHeight + 16 : 24,
                        right: 24,
                        zIndex: 1301,
                        transition: "bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        bgcolor: isOpen ? "#1e293b" : "#0f172a",
                        color: "#e2e8f0",
                        "&:hover": { bgcolor: "#334155" },
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                >
                    <Badge
                        badgeContent={errorCount}
                        color="error"
                        invisible={errorCount === 0}
                        sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", minWidth: 16, height: 16 } }}
                    >
                        <NetworkCheckIcon />
                    </Badge>
                </Fab>
            </Tooltip>

            {/* ── Panel ──────────────────────────────────────── */}
            <Box
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: isOpen ? panelHeight : 0,
                    zIndex: 1300,
                    transition: isDragging.current ? "none" : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                    pointerEvents: isOpen ? "auto" : "none",
                }}
            >
                <Paper
                    elevation={16}
                    sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderTop: "2px solid",
                        borderColor: "primary.main",
                        borderRadius: 0,
                        bgcolor: "background.paper",
                    }}
                >
                    {/* Drag handle */}
                    <Box
                        onMouseDown={handleDragStart}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 8,
                            cursor: "row-resize",
                            bgcolor: "action.hover",
                            "&:hover": { bgcolor: "primary.main", "& svg": { color: "#fff" } },
                            transition: "background-color 0.15s",
                        }}
                    >
                        <DragHandleIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                    </Box>

                    {/* Toolbar */}
                    <Box
                        px={2}
                        py={0.5}
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        borderBottom="1px solid"
                        borderColor="divider"
                        sx={{ minHeight: 40 }}
                    >
                        <NetworkCheckIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mr: 1 }}>
                            Network Logs
                        </Typography>
                        <Chip
                            label={entries.length}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                        />
                        {errorCount > 0 && (
                            <Chip
                                label={`${errorCount} err`}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                            />
                        )}
                        <Box flex={1} />
                        <Tooltip title="Open full page">
                            <IconButton
                                size="small"
                                component="a"
                                href="/diagnose/network-logs"
                                sx={{ color: "text.secondary" }}
                            >
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear logs">
                            <IconButton size="small" onClick={() => networkLogStore.clear()} sx={{ color: "text.secondary" }}>
                                <DeleteSweepIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close panel">
                            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: "text.secondary" }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Content */}
                    <PanelContent entries={entries} />
                </Paper>
            </Box>
        </>
    );
}

// ─── Panel Content (list + detail) ────────────────────────────────────

function PanelContent({ entries }: { entries: NetworkLogEntry[] }) {
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState(0);
    const [copied, setCopied] = useState(false);

    const filtered = entries.filter((e) => {
        const q = search.toLowerCase();
        if (q && !e.url.toLowerCase().includes(q) && !e.fullUrl.toLowerCase().includes(q) && !e.method.toLowerCase().includes(q) && !e.source.toLowerCase().includes(q))
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

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
            {/* Filters row */}
            <Box px={2} py={0.75} display="flex" gap={1} alignItems="center" borderBottom="1px solid" borderColor="divider" flexWrap="wrap">
                <TextField
                    size="small"
                    placeholder="Filter..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 180, "& .MuiOutlinedInput-root": { borderRadius: 1.5, height: 30 }, "& .MuiOutlinedInput-input": { py: 0.5, fontSize: "0.8rem" } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Stack direction="row" spacing={0.25}>
                    {(["ALL", "GET", "POST", "PUT", "DELETE"] as MethodFilter[]).map((m) => (
                        <Chip
                            key={m} label={m} size="small"
                            variant={methodFilter === m ? "filled" : "outlined"}
                            onClick={() => setMethodFilter(m)}
                            sx={{
                                fontWeight: 600, fontSize: "0.6rem", height: 22, cursor: "pointer",
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
                <Stack direction="row" spacing={0.25}>
                    {(["ALL", "2xx", "4xx", "5xx", "ERR"] as StatusFilter[]).map((s) => (
                        <Chip
                            key={s} label={s} size="small"
                            variant={statusFilter === s ? "filled" : "outlined"}
                            onClick={() => setStatusFilter(s)}
                            sx={{ fontWeight: 600, fontSize: "0.6rem", height: 22, cursor: "pointer" }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Split: list + detail */}
            <Box flex={1} display="flex" minHeight={0}>
                {/* List */}
                <Box
                    sx={{
                        flex: selected ? "0 0 50%" : 1,
                        display: "flex",
                        flexDirection: "column",
                        borderRight: selected ? "1px solid" : "none",
                        borderColor: "divider",
                        overflow: "hidden",
                    }}
                >
                    {/* Col headers */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "55px 100px 1fr 60px 70px",
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            bgcolor: "action.hover",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">Method</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">Source</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">URL</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">Status</Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize="0.65rem">Time</Typography>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: "auto" }}>
                        {filtered.length === 0 ? (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%" p={2}>
                                <Typography variant="caption" color="text.secondary">
                                    {entries.length === 0 ? "Waiting for API calls..." : "No matches"}
                                </Typography>
                            </Box>
                        ) : (
                            filtered.map((entry, idx) => (
                                <Box
                                    key={entry.id}
                                    onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "55px 100px 1fr 60px 70px",
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.4,
                                        cursor: "pointer",
                                        borderBottom: "1px solid",
                                        borderColor: "divider",
                                        bgcolor: selectedId === entry.id
                                            ? "action.selected"
                                            : entry.error
                                                ? "rgba(239,68,68,0.04)"
                                                : "transparent",
                                        "&:hover": { bgcolor: selectedId === entry.id ? "action.selected" : "action.hover" },
                                        transition: "background-color 0.1s",
                                    }}
                                >
                                    <Box display="flex" alignItems="center">
                                        <Chip label={entry.method} size="small" sx={{ fontWeight: 700, fontSize: "0.6rem", height: 20, bgcolor: METHOD_COLORS[entry.method] || "#64748b", color: "#fff" }} />
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                        <Chip label={entry.source} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.55rem", height: 20, maxWidth: 95, borderColor: SOURCE_COLORS[entry.source] || "#94a3b8", color: SOURCE_COLORS[entry.source] || "#94a3b8" }} />
                                    </Box>
                                    <Tooltip title={entry.fullUrl} placement="top-start">
                                        <Typography variant="caption" sx={{ lineHeight: "24px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem" }}>
                                            {entry.url}
                                        </Typography>
                                    </Tooltip>
                                    <Box display="flex" alignItems="center">
                                        {entry.pending ? (
                                            <Chip label="…" size="small" variant="outlined" color="info" sx={{ fontWeight: 600, fontSize: "0.6rem", height: 20 }} />
                                        ) : entry.error ? (
                                            <Chip label={entry.status || "ERR"} size="small" color="error" sx={{ fontWeight: 700, fontSize: "0.6rem", height: 20 }} />
                                        ) : (
                                            <Chip label={entry.status} size="small" color={statusColor(entry.status)} variant="outlined" sx={{ fontWeight: 700, fontSize: "0.6rem", height: 20 }} />
                                        )}
                                    </Box>
                                    <Typography variant="caption" sx={{ lineHeight: "24px", fontFamily: "'Fira Code', monospace", fontSize: "0.65rem", color: (entry.duration ?? 0) > 1000 ? "warning.main" : "text.secondary" }}>
                                        {formatDuration(entry.duration)}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                {/* Detail */}
                {selected && (
                    <Box sx={{ flex: "0 0 50%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        {/* Detail header */}
                        <Box px={1.5} py={0.5} display="flex" alignItems="center" gap={0.5} borderBottom="1px solid" borderColor="divider" bgcolor="action.hover">
                            {statusIcon(selected.status)}
                            <Chip label={selected.method} size="small" sx={{ fontWeight: 700, fontSize: "0.6rem", height: 20, bgcolor: METHOD_COLORS[selected.method] || "#64748b", color: "#fff" }} />
                            <Tooltip title={selected.fullUrl}>
                                <Typography variant="caption" fontWeight={600} sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem" }}>
                                    {selected.url}
                                </Typography>
                            </Tooltip>
                            {selected.status !== null && (
                                <Chip label={`${selected.status}`} size="small" color={statusColor(selected.status)} variant="outlined" sx={{ fontWeight: 700, fontSize: "0.6rem", height: 20 }} />
                            )}
                            <IconButton size="small" onClick={() => setSelectedId(null)} sx={{ p: 0.25 }}>
                                <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>

                        {/* Info row */}
                        <Box px={1.5} py={0.5} borderBottom="1px solid" borderColor="divider" display="flex" gap={2} flexWrap="wrap">
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                <b style={{ color: SOURCE_COLORS[selected.source] }}>{selected.source}</b>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                ⏱ {formatDuration(selected.duration)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                📦 {formatBytes(selected.size)}
                            </Typography>
                            {selected.error && (
                                <Typography variant="caption" color="error.main" fontSize="0.7rem" fontWeight={600}>
                                    ❌ {selected.error}
                                </Typography>
                            )}
                        </Box>

                        {/* Tabs */}
                        <Tabs
                            value={detailTab}
                            onChange={(_, v) => setDetailTab(v)}
                            sx={{
                                borderBottom: "1px solid", borderColor: "divider", minHeight: 30,
                                "& .MuiTab-root": { fontSize: "0.7rem", minHeight: 30, py: 0, px: 1.5, minWidth: "auto" },
                            }}
                        >
                            <Tab label="Req Headers" />
                            <Tab label="Req Body" />
                            <Tab label="Res Headers" />
                            <Tab label="Res Body" />
                        </Tabs>

                        {/* Tab content */}
                        <Box flex={1} overflow="auto">
                            {detailTab === 0 && <CompactHeaders headers={selected.requestHeaders} onCopy={handleCopy} />}
                            {detailTab === 1 && <CompactCode content={tryPrettyJson(selected.requestBody)} onCopy={handleCopy} empty="No request body" />}
                            {detailTab === 2 && <CompactHeaders headers={selected.responseHeaders} onCopy={handleCopy} />}
                            {detailTab === 3 && (
                                <CompactCode
                                    content={tryPrettyJson(selected.responseBody) || (selected.error ? `Error: ${selected.error}` : "")}
                                    onCopy={handleCopy}
                                    empty={selected.pending ? "Waiting..." : "No response body"}
                                    isError={!!selected.error && !selected.responseBody}
                                />
                            )}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Copy toast */}
            {copied && (
                <Alert severity="success" sx={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", borderRadius: 2, zIndex: 9999, boxShadow: 6, py: 0 }}>
                    Copied!
                </Alert>
            )}
        </Box>
    );
}

// ─── Compact sub-components ───────────────────────────────────────────

function CompactHeaders({ headers, onCopy }: { headers: Record<string, string>; onCopy: (t: string) => void }) {
    const entries = Object.entries(headers);
    if (entries.length === 0) {
        return <Box p={2} display="flex" alignItems="center" justifyContent="center"><Typography variant="caption" color="text.secondary">No headers</Typography></Box>;
    }
    return (
        <Box>
            <Box display="flex" justifyContent="flex-end" px={1} py={0.25}>
                <Tooltip title="Copy as JSON">
                    <IconButton size="small" onClick={() => onCopy(JSON.stringify(headers, null, 2))}>
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>
            </Box>
            {entries.map(([k, v]) => (
                <Box key={k} sx={{ display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "action.hover" } }}>
                    <Typography variant="caption" fontWeight={600} sx={{ px: 1.5, py: 0.4, color: "primary.main", fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", borderRight: "1px solid", borderColor: "divider", wordBreak: "break-all" }}>
                        {k}
                    </Typography>
                    <Typography variant="caption" sx={{ px: 1.5, py: 0.4, fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", wordBreak: "break-all" }}>
                        {v}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

function CompactCode({ content, onCopy, empty, isError }: { content: string; onCopy: (t: string) => void; empty: string; isError?: boolean }) {
    if (!content) {
        return <Box p={2} display="flex" alignItems="center" justifyContent="center"><Typography variant="caption" color="text.secondary">{empty}</Typography></Box>;
    }
    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box display="flex" justifyContent="flex-end" px={1} py={0.25} bgcolor="#0f172a" borderBottom="1px solid #334155">
                <Tooltip title="Copy">
                    <IconButton size="small" onClick={() => onCopy(content)} sx={{ color: "#94a3b8" }}>
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box
                component="pre"
                sx={{
                    flex: 1, m: 0, p: 1.5, bgcolor: "#1e293b",
                    color: isError ? "#fca5a5" : "#e2e8f0",
                    fontFamily: "'Fira Code', monospace", fontSize: "0.75rem",
                    lineHeight: 1.6, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
                }}
            >
                {content}
            </Box>
        </Box>
    );
}
