"use client";

import { Box, Paper, Typography, Stack } from "@mui/material";
import { memo } from "react";
import {
  NODE_ICONS,
  STATE_PALETTE,
  TOKEN,
  type StateType,
} from "./WorkflowNodes";

interface NodePreviewProps {
  type: StateType;
  label: string;
  description?: string;
  config?: Record<string, unknown>;
}

function NodePreview({ type, label, description, config }: NodePreviewProps) {
  const palette = STATE_PALETTE[type];
  const Icon = NODE_ICONS[type];

  const getConfigSummary = () => {
    if (!config) return null;
    const entries = Object.entries(config);
    if (entries.length === 0) return null;
    return (
      <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${palette.border}` }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Configuration:
        </Typography>
        <Stack spacing={0.5}>
          {entries.map(([key, value]) => (
            <Typography key={key} variant="caption" sx={{ fontFamily: "monospace", fontSize: 11 }}>
              {key}: {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </Typography>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1.5px solid ${palette.border}`,
        borderRadius: `${TOKEN.radius}px`,
        backgroundColor: "#fff",
        minWidth: 200,
        maxWidth: 300,
        overflow: "hidden",
      }}
    >
      {/* themed header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          backgroundColor: palette.bg,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            backgroundColor: palette.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} strokeWidth={2.4} />
        </Box>
        <Typography
          variant="caption"
          fontWeight={800}
          color={palette.text}
          textTransform="uppercase"
          letterSpacing={0.8}
        >
          {type}
        </Typography>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="body1"
          fontWeight={600}
          color={TOKEN.labelColor}
          sx={{ mb: 0.5, fontFamily: TOKEN.font }}
        >
          {label || "Untitled"}
        </Typography>

        {description && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {description}
          </Typography>
        )}

        {getConfigSummary()}
      </Box>
    </Paper>
  );
}

export default memo(NodePreview);
