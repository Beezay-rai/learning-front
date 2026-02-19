"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Snackbar,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

import { DEFAULT_FILES, buildTree, getFileIcon } from "./projectDefaults";
import FileTree from "./FileTree";
import { buildPreviewDoc } from "./previewBuilder";

// ---------------- helpers ----------------
function getExtension(name: string) {
    return (name.split(".").pop() ?? "").toLowerCase();
}

function getLang(path: string) {
    const ext = getExtension(path);
    if (ext === "js" || ext === "jsx" || ext === "ts" || ext === "tsx")
        return javascript({ jsx: true, typescript: ext === "ts" || ext === "tsx" });
    if (ext === "css") return css();
    if (ext === "html") return html();
    if (ext === "json") return json();
    return javascript({ jsx: true });
}

// ---- Dialog for naming ----
interface PromptDialogProps {
    open: boolean;
    title: string;
    defaultValue?: string;
    onConfirm: (val: string) => void;
    onCancel: () => void;
}
function PromptDialog({ open, title, defaultValue = "", onConfirm, onCancel }: PromptDialogProps) {
    const [val, setVal] = useState(defaultValue);
    useEffect(() => setVal(defaultValue), [defaultValue, open]);
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") onConfirm(val.trim()); }}
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} size="small">Cancel</Button>
                <Button variant="contained" onClick={() => onConfirm(val.trim())} size="small">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ============================================================
//  Main Page
// ============================================================
export default function CodeEditorPage() {
    const [files, setFiles] = useState<Record<string, string>>({ ...DEFAULT_FILES });
    const [openTabs, setOpenTabs] = useState<string[]>(["src/App.jsx"]);
    const [activeTab, setActiveTab] = useState("src/App.jsx");
    const [previewDoc, setPreviewDoc] = useState(() => buildPreviewDoc(DEFAULT_FILES));
    const [previewKey, setPreviewKey] = useState(0);
    const [snack, setSnack] = useState("");
    const [autoRun, setAutoRun] = useState(false);

    // Dialog state
    const [dialog, setDialog] = useState<{
        type: "add-file" | "add-folder" | "rename";
        folderPath: string;
        currentName?: string;
        isFolder?: boolean;
    } | null>(null);

    // Track unsaved changes
    const [unsaved, setUnsaved] = useState<Set<string>>(new Set());
    const savedFiles = useRef<Record<string, string>>({ ...DEFAULT_FILES });

    // ─── File editing ───
    const handleChange = (path: string, value: string) => {
        setFiles((f) => ({ ...f, [path]: value }));
        setUnsaved((s) => new Set(s).add(path));
        if (autoRun) {
            setPreviewDoc(buildPreviewDoc({ ...files, [path]: value }));
            setPreviewKey((k) => k + 1);
        }
    };

    // ─── Run / manual rebuild ───
    const handleRun = useCallback(() => {
        const doc = buildPreviewDoc(files);
        setPreviewDoc(doc);
        setPreviewKey((k) => k + 1);
        savedFiles.current = { ...files };
        setUnsaved(new Set());
    }, [files]);

    // ─── Ctrl+S to save ───
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleRun();
                setSnack("Saved & refreshed preview");
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleRun]);

    // ─── Open file ───
    const openFile = (path: string) => {
        setOpenTabs((t) => (t.includes(path) ? t : [...t, path]));
        setActiveTab(path);
    };

    // ─── Close tab ───
    const closeTab = (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const idx = openTabs.indexOf(path);
        const next = openTabs.filter((t) => t !== path);
        setOpenTabs(next);
        if (activeTab === path) {
            setActiveTab(next[Math.max(0, idx - 1)] ?? "");
        }
    };

    // ─── Reset project ───
    const resetProject = () => {
        setFiles({ ...DEFAULT_FILES });
        setOpenTabs(["src/App.jsx"]);
        setActiveTab("src/App.jsx");
        setUnsaved(new Set());
        setPreviewDoc(buildPreviewDoc(DEFAULT_FILES));
        setPreviewKey((k) => k + 1);
        setSnack("Project reset to defaults");
    };

    // ─── File tree actions ───
    const handleAddFile = (folderPath: string) => {
        setDialog({ type: "add-file", folderPath });
    };
    const handleAddFolder = (folderPath: string) => {
        setDialog({ type: "add-folder", folderPath });
    };
    const handleRename = (path: string, isFolder: boolean) => {
        const name = path.split("/").pop() ?? path;
        setDialog({ type: "rename", folderPath: path, currentName: name, isFolder });
    };
    const handleDelete = (path: string, isFolder: boolean) => {
        setFiles((prev) => {
            const next = { ...prev };
            if (isFolder) {
                Object.keys(next).forEach((k) => { if (k.startsWith(path + "/") || k === path) delete next[k]; });
            } else {
                delete next[path];
            }
            return next;
        });
        setOpenTabs((t) => {
            const filtered = t.filter((tp) => !tp.startsWith(isFolder ? path + "/" : path));
            const nextActive = filtered.includes(activeTab) ? activeTab : filtered[0] ?? "";
            setActiveTab(nextActive);
            return filtered;
        });
        setSnack("Deleted " + path.split("/").pop());
    };

    const handleDialogConfirm = (val: string) => {
        if (!val || !dialog) { setDialog(null); return; }

        if (dialog.type === "add-file") {
            const newPath = dialog.folderPath ? `${dialog.folderPath}/${val}` : val;
            if (files[newPath]) { setSnack("File already exists"); setDialog(null); return; }
            setFiles((f) => ({ ...f, [newPath]: "// " + val + "\n" }));
            openFile(newPath);
            setSnack("Created " + val);
        } else if (dialog.type === "add-folder") {
            const placeholder = dialog.folderPath
                ? `${dialog.folderPath}/${val}/.gitkeep`
                : `${val}/.gitkeep`;
            setFiles((f) => ({ ...f, [placeholder]: "" }));
            setSnack("Created folder " + val);
        } else if (dialog.type === "rename") {
            const oldPath = dialog.folderPath;
            const isFolder = !!dialog.isFolder;
            const parentDir = oldPath.includes("/") ? oldPath.split("/").slice(0, -1).join("/") : "";
            const newPath = parentDir ? `${parentDir}/${val}` : val;

            setFiles((prev) => {
                const next: Record<string, string> = {};
                for (const [k, v] of Object.entries(prev)) {
                    if (isFolder && (k === oldPath || k.startsWith(oldPath + "/"))) {
                        next[k.replace(oldPath, newPath)] = v;
                    } else if (!isFolder && k === oldPath) {
                        next[newPath] = v;
                    } else {
                        next[k] = v;
                    }
                }
                return next;
            });
            setOpenTabs((t) => t.map((tp) => {
                if (isFolder && (tp === oldPath || tp.startsWith(oldPath + "/")))
                    return tp.replace(oldPath, newPath);
                if (!isFolder && tp === oldPath) return newPath;
                return tp;
            }));
            if (activeTab === oldPath || (isFolder && activeTab.startsWith(oldPath + "/"))) {
                setActiveTab(activeTab.replace(oldPath, newPath));
            }
            setSnack("Renamed to " + val);
        }
        setDialog(null);
    };

    // ─── Build tree ───
    const tree = buildTree(files);

    // ─── Preview-only files not shown in editor ───
    const currentContent = activeTab ? (files[activeTab] ?? "") : "";
    const currentLang = activeTab ? getLang(activeTab) : javascript({ jsx: true });

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 110px)" gap={1.5}>
            {/* ── Top Bar ── */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        ⚡ Vite Playground
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.25}>
                        In-browser React IDE — edit files and run to preview
                    </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                    <Chip
                        label="Auto-run"
                        size="small"
                        variant={autoRun ? "filled" : "outlined"}
                        color={autoRun ? "success" : "default"}
                        onClick={() => setAutoRun((a) => !a)}
                        sx={{ cursor: "pointer" }}
                    />
                    <Tooltip title="Reset to default project">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={resetProject}
                            sx={{ borderRadius: 2 }}
                        >
                            Reset
                        </Button>
                    </Tooltip>
                    <Tooltip title="Run & refresh preview (Ctrl+S)">
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleRun}
                            sx={{ borderRadius: 2 }}
                        >
                            Run
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            <Divider />

            {/* ── Main 3-panel layout ── */}
            <Box display="flex" flex={1} gap={1.5} minHeight={0}>

                {/* File Tree */}
                <FileTree
                    nodes={tree}
                    activeFile={activeTab}
                    onFileClick={openFile}
                    onAddFile={handleAddFile}
                    onAddFolder={handleAddFolder}
                    onRename={handleRename}
                    onDelete={handleDelete}
                />

                {/* Editor Panel */}
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    minHeight={0}
                    minWidth={0}
                    sx={{
                        bgcolor: "#1e293b",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid #334155",
                    }}
                >
                    {/* File tabs */}
                    {openTabs.length > 0 ? (
                        <>
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{
                                    bgcolor: "#0f172a",
                                    borderBottom: "1px solid #1e293b",
                                    overflowX: "auto",
                                    flexShrink: 0,
                                    "&::-webkit-scrollbar": { height: 4 },
                                    "&::-webkit-scrollbar-thumb": { bgcolor: "#334155", borderRadius: 2 },
                                }}
                            >
                                {openTabs.map((path) => {
                                    const name = path.split("/").pop() ?? path;
                                    const isActive = path === activeTab;
                                    const isDirty = unsaved.has(path);
                                    return (
                                        <Box
                                            key={path}
                                            display="flex"
                                            alignItems="center"
                                            gap={0.75}
                                            px={1.5}
                                            py={0.75}
                                            onClick={() => setActiveTab(path)}
                                            sx={{
                                                cursor: "pointer",
                                                borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
                                                bgcolor: isActive ? "#1e293b" : "transparent",
                                                color: isActive ? "#e2e8f0" : "#64748b",
                                                whiteSpace: "nowrap",
                                                flexShrink: 0,
                                                transition: "all 0.15s",
                                                "&:hover": { bgcolor: "#1e293b", color: "#e2e8f0" },
                                            }}
                                        >
                                            <Typography sx={{ fontSize: "0.75rem" }}>
                                                {getFileIcon(name)}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.8rem", fontWeight: isActive ? 600 : 400 }}>
                                                {name}
                                                {isDirty && (
                                                    <Box component="span" sx={{ color: "#f59e0b", ml: 0.5 }}>●</Box>
                                                )}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => closeTab(path, e)}
                                                sx={{
                                                    p: 0.1,
                                                    color: "#475569",
                                                    "&:hover": { color: "#94a3b8" },
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* CodeMirror editor */}
                            <Box flex={1} overflow="auto">
                                <CodeMirror
                                    key={activeTab}
                                    value={currentContent}
                                    height="100%"
                                    theme={vscodeDark}
                                    extensions={[currentLang]}
                                    onChange={(val) => handleChange(activeTab, val)}
                                    basicSetup={{
                                        lineNumbers: true,
                                        foldGutter: true,
                                        highlightActiveLineGutter: true,
                                        highlightActiveLine: true,
                                        autocompletion: true,
                                        closeBrackets: true,
                                        indentOnInput: true,
                                        tabSize: 2,
                                    }}
                                    style={{ height: "100%", fontSize: "0.85rem" }}
                                />
                            </Box>
                        </>
                    ) : (
                        <Box
                            flex={1}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{ color: "#475569" }}
                        >
                            <Typography sx={{ fontSize: "2rem", mb: 1 }}>📂</Typography>
                            <Typography variant="body2" color="text.disabled">
                                Click a file in the explorer to open it
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Preview Panel */}
                <Box
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    minHeight={0}
                    minWidth={0}
                    sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#fff",
                    }}
                >
                    <Box
                        px={2}
                        py={0.75}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            bgcolor: "grey.50",
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            flexShrink: 0,
                        }}
                    >
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            🖥 Live Preview
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            {unsaved.size > 0 && (
                                <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                                    {unsaved.size} unsaved file{unsaved.size > 1 ? "s" : ""} — press Run
                                </Typography>
                            )}
                            <Chip label="React 18" size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                            <Chip label="Babel" size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                        </Box>
                    </Box>
                    <Box
                        component="iframe"
                        key={previewKey}
                        srcDoc={previewDoc}
                        sandbox="allow-scripts allow-same-origin"
                        sx={{ flex: 1, border: "none", width: "100%", height: "100%" }}
                        title="vite-preview"
                    />
                </Box>
            </Box>

            {/* Prompt Dialog */}
            <PromptDialog
                open={dialog !== null}
                title={
                    dialog?.type === "add-file"
                        ? `New file in ${dialog.folderPath || "/"}`
                        : dialog?.type === "add-folder"
                            ? `New folder in ${dialog?.folderPath || "/"}`
                            : `Rename "${dialog?.currentName}"`
                }
                defaultValue={dialog?.currentName ?? ""}
                onConfirm={handleDialogConfirm}
                onCancel={() => setDialog(null)}
            />

            {/* Snackbar */}
            <Snackbar
                open={!!snack}
                autoHideDuration={2500}
                onClose={() => setSnack("")}
                message={snack}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Box>
    );
}
