"use client";

import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { memo } from "react";
import {
  NODE_ICONS,
  STATE_PALETTE,
  type StateType,
  type PaletteItem,
} from "./WorkflowNodes";

interface NodeTypeSelectorProps {
  name?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { type: "Task", label: "Task", description: "Invoke a resource" },
  { type: "Choice", label: "Choice", description: "Branch on condition" },
  { type: "Parallel", label: "Parallel", description: "Run branches in parallel" },
  { type: "Map", label: "Map", description: "Iterate over array" },
  { type: "Wait", label: "Wait", description: "Delay or wait for event" },
  { type: "Pass", label: "Pass", description: "Pass input to output" },
  { type: "Succeed", label: "Succeed", description: "End successfully" },
  { type: "Fail", label: "Fail", description: "End with error" },
];

function NodeTypeSelector({
  name = "type",
  label = "Node Type",
  error = false,
  helperText,
  disabled = false,
}: NodeTypeSelectorProps) {
  const { control, watch, formState: { errors } } = useFormContext();
  const isFieldError = errors[name as keyof typeof errors];
  const hasError = error || !!isFieldError;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={hasError} disabled={disabled} sx={{ minWidth: 200 }}>
          <InputLabel error={hasError}>{label}</InputLabel>
          <Select
            {...field}
            value={field.value || ""}
            label={label}
            error={hasError}
            disabled={disabled}
            renderValue={(selected) => {
              const item = PALETTE_ITEMS.find((i) => i.type === selected);
              if (!item) return <em>Select node type</em>;
              const theme = STATE_PALETTE[item.type as StateType];
              const Icon = NODE_ICONS[item.type as StateType];
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon size={16} color={theme.accent} />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              );
            }}
          >
            <MenuItem key="" value="" disabled>
              <em>Select node type</em>
            </MenuItem>
            {PALETTE_ITEMS.map((item) => {
              const theme = STATE_PALETTE[item.type as StateType];
              const Icon = NODE_ICONS[item.type as StateType];
              return (
                <MenuItem key={item.type} value={item.type}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        color: theme.accent,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} strokeWidth={2.2} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              );
            })}
          </Select>
          <FormHelperText error={hasError}>
            {helperText || (isFieldError?.message as string) || null}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
}

export default memo(NodeTypeSelector);
