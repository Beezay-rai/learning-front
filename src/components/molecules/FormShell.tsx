"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { Settings2 } from "lucide-react";
import type { ReactNode } from "react";

type FormShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  component?: "form" | "div";
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

export default function FormShell({
  title,
  description,
  children,
  component = "div",
  onSubmit,
}: FormShellProps) {
  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, bgcolor: "action.hover" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Settings2 size={22} />
          <Box>
            <Typography variant="h6">{title}</Typography>
            {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Box component={component} onSubmit={onSubmit} sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </Box>
    </Paper>
  );
}
