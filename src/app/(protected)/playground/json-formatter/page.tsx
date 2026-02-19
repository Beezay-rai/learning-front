"use client";

import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Chip,
    Divider,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CompressIcon from "@mui/icons-material/Compress";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const sampleJson = `{
  "name": "Playground",
  "version": "1.0.0",
  "features": ["code-editor", "page-checker", "json-formatter", "api-tester"],
  "settings": {
    "theme": "dark",
    "autoFormat": true
  },
  "active": true
}`;

export default function JsonFormatterPage() {
    const [input, setInput] = useState(sampleJson);
    const [formatted, setFormatted] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [indent, setIndent] = useState(2);

    const getValidity = () => {
        if (!input.trim()) return null;
        try { JSON.parse(input); return true; } catch { return false; }
    };
    const valid = getValidity();

    const format = () => {
        try {
            setFormatted(JSON.stringify(JSON.parse(input), null, indent));
            setError("");
        } catch (e: unknown) {
            setError((e as Error).message);
            setFormatted("");
        }
    };

    const minify = () => {
        try {
            setFormatted(JSON.stringify(JSON.parse(input)));
            setError("");
        } catch (e: unknown) {
            setError((e as Error).message);
            setFormatted("");
        }
    };

    const copy = async () => {
        await navigator.clipboard.writeText(formatted || input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clear = () => { setInput(""); setFormatted(""); setError(""); };

    return (
        <Box display="flex" flexDirection="column" height="calc(100vh - 120px)" gap={2}>
            {/* Header */}
            <Box>
                <Typography variant="h5" fontWeight={700}>
                    🔧 JSON Formatter
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                    Paste JSON to validate, format, and minify
                </Typography>
            </Box>

            <Divider />

            {/* Toolbar */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AutoFixHighIcon />}
                    onClick={format}
                    size="small"
                    sx={{ borderRadius: 2 }}
                >
                    Format
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CompressIcon />}
                    onClick={minify}
                    size="small"
                    sx={{ borderRadius: 2 }}
                >
                    Minify
                </Button>
                <Button
                    variant="outlined"
                    startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={copy}
                    size="small"
                    sx={{ borderRadius: 2 }}
                >
                    {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={clear}
                    size="small"
                    sx={{ borderRadius: 2 }}
                >
                    Clear
                </Button>

                <Box ml="auto !important" display="flex" alignItems="center" gap={1}>
                    {valid !== null && (
                        <Chip
                            size="small"
                            icon={valid ? <CheckIcon /> : undefined}
                            label={valid ? "Valid JSON" : "Invalid JSON"}
                            color={valid ? "success" : "error"}
                            variant="outlined"
                        />
                    )}
                    <Select
                        size="small"
                        value={indent}
                        onChange={(e) => setIndent(Number(e.target.value))}
                        sx={{ fontSize: "0.8rem", borderRadius: 2 }}
                    >
                        <MenuItem value={2}>2 spaces</MenuItem>
                        <MenuItem value={4}>4 spaces</MenuItem>
                        <MenuItem value={8}>8 spaces</MenuItem>
                    </Select>
                </Box>
            </Stack>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
                    {error}
                </Alert>
            )}

            {/* Editor area */}
            <Box display="flex" flex={1} gap={2} minHeight={0}>
                {/* Input */}
                <Box flex={1} display="flex" flexDirection="column" gap={0.5} minHeight={0}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                        Input
                    </Typography>
                    <Paper elevation={0} sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                        <Box
                            component="textarea"
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                            spellCheck={false}
                            placeholder="Paste your JSON here..."
                            sx={{
                                flex: 1,
                                p: 2,
                                border: "none",
                                outline: "none",
                                resize: "none",
                                fontFamily: "'Fira Code', 'Courier New', monospace",
                                fontSize: "0.8rem",
                                lineHeight: 1.7,
                                overflowY: "auto",
                                bgcolor: "background.paper",
                                color: "text.primary",
                            }}
                        />
                    </Paper>
                </Box>

                {/* Output */}
                <Box flex={1} display="flex" flexDirection="column" gap={0.5} minHeight={0}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                        Output
                    </Typography>
                    <Paper elevation={0} sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", display: "flex", bgcolor: "grey.50" }}>
                        <Box
                            component="textarea"
                            value={formatted}
                            readOnly
                            spellCheck={false}
                            placeholder="Formatted JSON will appear here..."
                            sx={{
                                flex: 1,
                                p: 2,
                                border: "none",
                                outline: "none",
                                resize: "none",
                                fontFamily: "'Fira Code', 'Courier New', monospace",
                                fontSize: "0.8rem",
                                lineHeight: 1.7,
                                overflowY: "auto",
                                bgcolor: "grey.50",
                                color: "text.primary",
                            }}
                        />
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
