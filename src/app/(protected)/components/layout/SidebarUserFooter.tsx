"use client";

import { Avatar, Box, ButtonBase, Stack, Tooltip, Typography } from "@mui/material";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

interface SidebarUserFooterProps {
  fullName: string;
  email: string;
  collapsed: boolean;
  onClick: () => void;
}

export function SidebarUserFooter({
  fullName,
  email,
  collapsed,
  onClick,
}: SidebarUserFooterProps) {
  return (
    <Tooltip title={collapsed ? fullName : ""} placement="right">
      <ButtonBase
        onClick={onClick}
        aria-label="Account and log out"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-start",
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          textAlign: "left",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Stack direction="row" spacing={collapsed ? 0 : 2} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: "0.75rem",
            }}
          >
            {getInitials(fullName)}
          </Avatar>

          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={500} noWrap display="block">
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {email}
              </Typography>
            </Box>
          )}
        </Stack>
      </ButtonBase>
    </Tooltip>
  );
}