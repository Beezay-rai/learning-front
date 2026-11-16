"use client";

import { useMemo } from "react";
import { Box, Paper, Typography, Tooltip, Stack } from "@mui/material";
import { Workflow as WorkflowIcon } from "lucide-react";
import {
  NODE_ICONS,
  STATE_PALETTE,
  type StateType,
  type PaletteItem,
} from "./WorkflowNodes";

interface NodePaletteProps {
  onDragStart?: (nodeType: StateType) => void;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: "Task", label: "Task", description: "Execute a service or function" },
  { type: "Choice", label: "Choice", description: "Branch based on a condition" },
  { type: "Parallel", label: "Parallel", description: "Run branches concurrently" },
  { type: "Map", label: "Map", description: "Iterate over array items" },
  { type: "Wait", label: "Wait", description: "Delay or wait for an event" },
  { type: "Pass", label: "Pass", description: "Transform or pass data" },
  { type: "Succeed", label: "Succeed", description: "End workflow successfully" },
  { type: "Fail", label: "Fail", description: "End workflow with an error" },
];

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const items = useMemo(() => PALETTE_ITEMS, []);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: StateType,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/reactflow", nodeType);
    onDragStart?.(nodeType);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minWidth: 240,
        maxWidth: 260,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
          color: "text.primary",
        }}
      >
        <WorkflowIcon size={18} />
        Node Containers
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
        Drag a container type onto the canvas
      </Typography>

      <Stack spacing={1.25}>
        {items.map((item) => {
          const Icon = NODE_ICONS[item.type];
          const theme = STATE_PALETTE[item.type];

          return (
            <Tooltip
              key={item.type}
              title={
                <Box>
                  <Typography variant="caption" fontWeight={600} display="block">
                    {item.label}
                  </Typography>
                  <Typography variant="caption">{item.description}</Typography>
                </Box>
              }
              placement="right"
              arrow
            >
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  cursor: "grab",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  backgroundColor: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: theme.accent,
                    transform: "translateX(2px)",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.10)",
                  },
                  "&:active": {
                    cursor: "grabbing",
                  },
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.25,
                    bgcolor: theme.accent,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: theme.text, lineHeight: 1.3 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.text, opacity: 0.75, lineHeight: 1.25 }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Stack>
    </Paper>
  );
}
