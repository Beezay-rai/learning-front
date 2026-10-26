"use client";

import { Box, DialogTitle, Stack, Typography } from "@mui/material";
import { Settings2 } from "lucide-react";

export default function ModalFormHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <DialogTitle sx={{ bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Settings2 size={21} />
        <Box>
          <Typography variant="h6">{title}</Typography>
          {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
        </Box>
      </Stack>
    </DialogTitle>
  );
}
