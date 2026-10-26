"use client";

import { Box, Button } from "@mui/material";
import type { ReactNode } from "react";

export default function FormActions({
  submitLabel,
  cancel,
  loading = false,
  children,
}: {
  submitLabel: string;
  cancel?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
      {children}
      {cancel}
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </Box>
  );
}
