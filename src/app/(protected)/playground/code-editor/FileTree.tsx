import { FileNode, getFileIcon } from "./projectDefaults";
import {
    Box,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

interface FileTreeProps {
    nodes: FileNode[];
    activeFile: string;
    onFileClick: (path: string) => void;
    onAddFile: (folderPath: string) => void;
    onAddFolder: (folderPath: string) => void;
    onRename: (path: string, isFolder: boolean) => void;
    onDelete: (path: string, isFolder: boolean) => void;
}

interface ContextMenu {
    mouseX: number;
    mouseY: number;
    node: FileNode;
}

export default function FileTree({
    nodes,
    activeFile,
    onFileClick,
    onAddFile,
    onAddFolder,
    onRename,
    onDelete,
}: FileTreeProps) {
    const [open, setOpen] = useState<Record<string, boolean>>({ src: true });
    const [ctx, setCtx] = useState<ContextMenu | null>(null);

    const handleCtxOpen = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        e.stopPropagation();
        setCtx({ mouseX: e.clientX, mouseY: e.clientY, node });
    };

    const closeCtx = () => setCtx(null);

    function renderNodes(nodes: FileNode[], depth = 0) {
        return nodes.map((node) => {
            if (node.type === "folder") {
                const isOpen = open[node.path] ?? false;
                return (
                    <Box key={node.path}>
                        <Box
                            display="flex"
                            alignItems="center"
                            gap={0.3}
                            px={1}
                            py={0.3}
                            pl={`${(depth + 1) * 12}px`}
                            sx={{
                                cursor: "pointer",
                                borderRadius: 1,
                                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                                userSelect: "none",
                            }}
                            onClick={() =>
                                setOpen((o) => ({ ...o, [node.path]: !o[node.path] }))
                            }
                            onContextMenu={(e) => handleCtxOpen(e, node)}
                        >
                            <Box sx={{ color: "#94a3b8", display: "flex", fontSize: 14 }}>
                                {isOpen ? (
                                    <ExpandMoreIcon sx={{ fontSize: 14 }} />
                                ) : (
                                    <ChevronRightIcon sx={{ fontSize: 14 }} />
                                )}
                            </Box>
                            <Box sx={{ color: "#f59e0b", display: "flex" }}>
                                {isOpen ? (
                                    <FolderOpenIcon sx={{ fontSize: 14 }} />
                                ) : (
                                    <FolderIcon sx={{ fontSize: 14 }} />
                                )}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{ color: "#cbd5e1", fontWeight: 500, fontSize: "0.8rem" }}
                            >
                                {node.name}
                            </Typography>
                        </Box>
                        <Collapse in={isOpen}>
                            {renderNodes(node.children, depth + 1)}
                        </Collapse>
                    </Box>
                );
            }

            const isActive = activeFile === node.path;
            return (
                <Box
                    key={node.path}
                    display="flex"
                    alignItems="center"
                    gap={0.75}
                    px={1}
                    py={0.4}
                    pl={`${(depth + 1) * 12 + 18}px`}
                    onClick={() => onFileClick(node.path)}
                    onContextMenu={(e) => handleCtxOpen(e, node)}
                    sx={{
                        cursor: "pointer",
                        borderRadius: 1,
                        bgcolor: isActive ? "rgba(99,102,241,0.25)" : "transparent",
                        borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                        "&:hover": { bgcolor: isActive ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)" },
                        userSelect: "none",
                    }}
                >
                    <Box sx={{ fontSize: "0.75rem", lineHeight: 1 }}>
                        {getFileIcon(node.name)}
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            color: isActive ? "#e2e8f0" : "#94a3b8",
                            fontSize: "0.8rem",
                            fontWeight: isActive ? 600 : 400,
                        }}
                    >
                        {node.name}
                    </Typography>
                </Box>
            );
        });
    }

    return (
        <Box
            sx={{
                width: 220,
                flexShrink: 0,
                bgcolor: "#0f172a",
                borderRadius: 2,
                overflowY: "auto",
                border: "1px solid #1e293b",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Explorer header */}
            <Box
                px={1.5}
                py={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ borderBottom: "1px solid #1e293b" }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                    }}
                >
                    Explorer
                </Typography>
                <Box display="flex" gap={0.25}>
                    <IconButton
                        size="small"
                        title="New File"
                        onClick={() => onAddFile("")}
                        sx={{ color: "#475569", "&:hover": { color: "#94a3b8" }, p: 0.3 }}
                    >
                        <Typography sx={{ fontSize: 13, lineHeight: 1 }}>+📄</Typography>
                    </IconButton>
                    <IconButton
                        size="small"
                        title="New Folder"
                        onClick={() => onAddFolder("")}
                        sx={{ color: "#475569", "&:hover": { color: "#94a3b8" }, p: 0.3 }}
                    >
                        <Typography sx={{ fontSize: 13, lineHeight: 1 }}>+📁</Typography>
                    </IconButton>
                </Box>
            </Box>

            {/* Project label */}
            <Box px={1.5} py={0.75} sx={{ borderBottom: "1px solid #1e293b" }}>
                <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}
                >
                    📦 my-vite-app
                </Typography>
            </Box>

            {/* Tree */}
            <Box pt={0.5} pb={1}>
                {renderNodes(nodes)}
            </Box>

            {/* Context menu */}
            <Menu
                open={ctx !== null}
                onClose={closeCtx}
                anchorReference="anchorPosition"
                anchorPosition={
                    ctx ? { top: ctx.mouseY, left: ctx.mouseX } : undefined
                }
                PaperProps={{
                    sx: {
                        bgcolor: "#1e293b",
                        border: "1px solid #334155",
                        color: "#e2e8f0",
                        borderRadius: 2,
                        minWidth: 180,
                    },
                }}
            >
                {ctx?.node.type === "folder" && [
                    <MenuItem
                        key="add-file"
                        onClick={() => { onAddFile(ctx.node.path); closeCtx(); }}
                        sx={{ fontSize: "0.85rem", "&:hover": { bgcolor: "#334155" } }}
                    >
                        📄 New File
                    </MenuItem>,
                    <MenuItem
                        key="add-folder"
                        onClick={() => { onAddFolder(ctx.node.path); closeCtx(); }}
                        sx={{ fontSize: "0.85rem", "&:hover": { bgcolor: "#334155" } }}
                    >
                        📁 New Folder
                    </MenuItem>,
                ]}
                <MenuItem
                    onClick={() => { onRename(ctx!.node.path, ctx!.node.type === "folder"); closeCtx(); }}
                    sx={{ fontSize: "0.85rem", "&:hover": { bgcolor: "#334155" } }}
                >
                    ✏️ Rename
                </MenuItem>
                <MenuItem
                    onClick={() => { onDelete(ctx!.node.path, ctx!.node.type === "folder"); closeCtx(); }}
                    sx={{ color: "#f87171", fontSize: "0.85rem", "&:hover": { bgcolor: "#334155" } }}
                >
                    🗑️ Delete
                </MenuItem>
            </Menu>
        </Box>
    );
}
