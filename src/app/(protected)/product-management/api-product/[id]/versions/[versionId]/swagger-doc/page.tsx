"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Tooltip,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import SaveIcon from "@mui/icons-material/Save";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import * as yaml from "yaml";
import { useParams } from "next/navigation";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import { toast } from "react-toastify";

const DEFAULT_SWAGGER = `openapi: 3.0.0
info:
  title: Sample API
  description: Optional multiline or single-line description in [CommonMark](http://commonmark.org/help/) or HTML.
  version: 0.1.9
servers:
  - url: http://api.example.com/v1
    description: Optional server description, e.g. Main (production) server
paths:
  /users:
    get:
      summary: Returns a list of users. 
      description: Optional extended description in CommonMark or HTML.
      responses:
        '200':    # status code
          description: A JSON array of user names
          content:
            application/json:
              schema: 
                type: array
                items: 
                  type: string
`;

export default function SwaggerEditorPage() {
  const params = useParams();
  const productId = Number(params?.id);
  const versionId = Number(params?.versionId);

  const { useGetProductApiSpec, useUpdateProductApiSpec } =
    useOrchestratorApiService();

  const {
    data: apiSpecResponse,
    isLoading: isSpecLoading,
    refetch: refetchSpec,
  } = useGetProductApiSpec(productId, versionId);
  const updateApiSpecMutation = useUpdateProductApiSpec();

  const [code, setCode] = useState(DEFAULT_SWAGGER);
  const [spec, setSpec] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState("");

  // Split pane state
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const isDragging = useRef(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const handleMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const newPct = (ev.clientX / window.innerWidth) * 100;
      // Limit between 20% and 80%
      if (newPct > 20 && newPct < 80) {
        setLeftWidth(newPct);
      }
    };
    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  }, []);

  const updatePreview = useCallback((currentCode: string) => {
    try {
      let parsed;
      if (currentCode.trim().startsWith("{")) {
        parsed = JSON.parse(currentCode);
      } else {
        parsed = yaml.parse(currentCode);
      }
      setSpec(parsed);
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to parse Swagger definition";
      setError(message);
    }
  }, []);

  // Initial render
  useEffect(() => {
    updatePreview(code);
  }, [updatePreview]);

  useEffect(() => {
    const incomingSpec = apiSpecResponse?.data;
    if (!incomingSpec) return;

    const nextCode =
      typeof incomingSpec === "string"
        ? incomingSpec
        : yaml.stringify(incomingSpec);

    setCode(nextCode);
    updatePreview(nextCode);
  }, [apiSpecResponse, updatePreview]);

  const handleRun = () => {
    updatePreview(code);
    setSnack("Preview updated");
  };

  const handleSave = async () => {
    try {
      const payload = code.trim().startsWith("{")
        ? JSON.parse(code)
        : yaml.parse(code);

      await updateApiSpecMutation.mutateAsync({
        productId,
        versionId,
        payload,
      });

      toast.success("Saved successfully");
      setSnack("Saved successfully");
      refetchSpec();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save API spec";
      toast.error(message);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="calc(100vh - 110px)"
      gap={1.5}
    >
      Top Bar
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Swagger Editor
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Edit your OpenAPI definition in YAML or JSON, and preview in
            real-time.
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setCode(DEFAULT_SWAGGER);
              updatePreview(DEFAULT_SWAGGER);
            }}
          >
            Reset
          </Button>
          <Tooltip title="Run & refresh preview">
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
            >
              Run
            </Button>
          </Tooltip>
          <Tooltip title="Save">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
              disabled={updateApiSpecMutation.isPending}
              onClick={handleSave}
            >
              Save
            </Button>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
      {/* Main Split Layout */}
      <Box
        display="flex"
        flex={1}
        minHeight={0}
        position="relative"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Editor Panel (Left) */}
        <Box
          style={{ width: `${leftWidth}%` }}
          display="flex"
          flexDirection="column"
          bgcolor="#1e293b"
        >
          <Box
            px={2}
            py={1}
            borderBottom="1px solid #334155"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" fontWeight={600} color="#e2e8f0">
              Editor (YAML / JSON)
            </Typography>
            {error && (
              <Typography
                variant="caption"
                color="error.main"
                sx={{
                  ml: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                ⚠️ {error}
              </Typography>
            )}
          </Box>
          <Box flex={1} overflow="auto">
            {isSpecLoading ? (
              <Box
                display="flex"
                height="100%"
                alignItems="center"
                justifyContent="center"
              >
                <CircularProgress size={26} />
              </Box>
            ) : (
              <CodeMirror
                value={code}
                height="100%"
                theme={vscodeDark}
                extensions={[json()]} // YAML extension can be added later if needed
                onChange={(val) => setCode(val)}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                  autocompletion: true,
                  indentOnInput: true,
                  tabSize: 2,
                }}
                style={{ height: "100%", fontSize: "0.85rem" }}
              />
            )}
          </Box>
        </Box>

        {/* Resizer */}
        <Box
          onMouseDown={handleDragStart}
          sx={{
            width: 10,
            cursor: "col-resize",
            bgcolor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            "&:hover": { bgcolor: "primary.main", color: "white" },
            transition: "background-color 0.2s",
          }}
        >
          <DragHandleIcon
            sx={{
              fontSize: 16,
              transform: "rotate(90deg)",
              color: "text.disabled",
            }}
          />
        </Box>

        {/* Preview Panel (Right) */}
        <Box
          style={{ width: `${100 - leftWidth}%` }}
          display="flex"
          flexDirection="column"
          bgcolor="#fff"
          overflow="auto"
        >
          <Box
            px={2}
            py={1}
            borderBottom="1px solid"
            borderColor="divider"
            bgcolor="grey.50"
          >
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
            >
              Swagger UI Preview
            </Typography>
          </Box>
          <Box flex={1} overflow="auto" p={1}>
            {spec ? (
              <SwaggerUI spec={spec} />
            ) : (
              <Box
                display="flex"
                height="100%"
                alignItems="center"
                justifyContent="center"
              >
                {error ? (
                  <Typography color="error">
                    Fix syntax errors to preview
                  </Typography>
                ) : (
                  <CircularProgress />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
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
