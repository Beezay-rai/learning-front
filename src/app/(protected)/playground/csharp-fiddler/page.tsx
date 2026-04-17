"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TerminalIcon from "@mui/icons-material/Terminal";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
// Note: We don't have @codemirror/lang-csharp installed.
// We'll use a generic setup for now.
import axios from "axios";

const DEFAULT_CODE = `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, World!");
        
        for(int i = 1; i <= 5; i++)
        {
            Console.WriteLine($"Step {i}");
        }
    }
}`;

interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
}

export default function CSharpFiddlerPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");

  const handleRun = useCallback(async () => {
    if (!code.trim()) return;

    setLoading(true);
    setStatus("running");
    setOutput("Executing code...");

    try {
      const response = await axios.post<PistonResponse>(
        "https://emkc.org/api/v2/piston/execute",
        {
          language: "csharp",
          version: "6.12.0",
          files: [
            {
              name: "program.cs",
              content: code,
            },
          ],
        },
      );

      const { run } = response.data;
      setOutput(
        run.output ||
          (run.stderr ? `Error: ${run.stderr}` : "No output received."),
      );
      setStatus(run.code === 0 ? "success" : "error");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to execute code";
      setOutput(`API Error: ${message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleClear = () => {
    setOutput("");
    setStatus("idle");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || (e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRun]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="calc(100vh - 110px)"
      gap={2}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            <TerminalIcon
              sx={{ verticalAlign: "middle", mr: 1, color: "#8b5cf6" }}
            />
            C# Fiddler
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Run C# code snippets using .NET 6.12 runtime
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            onClick={handleRun}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? "Running..." : "Run (F5)"}
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Editor & Output */}
      <Box display="flex" flex={1} gap={2} minHeight={0}>
        {/* Editor Panel */}
        <Box
          flex={1.5}
          display="flex"
          flexDirection="column"
          gap={0.5}
          minHeight={0}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={0.5}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
            >
              Code Editor
            </Typography>
            <Chip
              label="C# / .NET 6"
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.65rem" }}
            />
          </Box>
          <Box
            flex={1}
            sx={{
              bgcolor: "#1e293b",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "#334155",
            }}
          >
            <CodeMirror
              value={code}
              height="100%"
              theme={vscodeDark}
              onChange={(val) => setCode(val)}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: true,
                autocompletion: true,
                closeBrackets: true,
                tabSize: 4,
              }}
              style={{ height: "100%", fontSize: "0.9rem" }}
            />
          </Box>
        </Box>

        {/* Output Panel */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap={0.5}
          minHeight={0}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={0.5}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
            >
              Console Output
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {status !== "idle" && (
                <Chip
                  label={status.toUpperCase()}
                  size="small"
                  color={
                    status === "success"
                      ? "success"
                      : status === "error"
                        ? "error"
                        : "primary"
                  }
                  variant="filled"
                  sx={{ fontSize: "0.6rem", height: 20 }}
                />
              )}
              <Tooltip title="Copy Output">
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  disabled={!output}
                >
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Console">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  disabled={!output}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              bgcolor: "#0f172a",
              color: status === "error" ? "#f87171" : "#e2e8f0",
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "#334155",
              overflowY: "auto",
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: "0.85rem",
              position: "relative",
            }}
          >
            <Box
              component="pre"
              sx={{ m: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}
            >
              {output || (
                <Typography variant="body2" color="text.disabled">
                  Output will appear here...
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
