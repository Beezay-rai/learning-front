"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useAuth } from "@/lib/auth/useAuth";
import { findActiveHref, findGroupIdByHref, menuItems } from "./MenuConfig";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarUserFooter } from "./SidebarUserFooter";

const EXPANDED_WIDTH = 300;
const COLLAPSED_WIDTH = 80;

const widthTransition = (collapsed: boolean) => (theme: Theme) =>
  theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: collapsed
      ? theme.transitions.duration.leavingScreen
      : theme.transitions.duration.enteringScreen,
  });

function LogoutDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm logout</DialogTitle>
      <DialogContent>Are you sure you want to log out?</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Log out
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { fullName = "", email = "" } = useGetUserInfo();

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openGroupId, setOpenGroupId] = React.useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const activeHref = React.useMemo(() => findActiveHref(pathname), [pathname]);

  React.useEffect(() => {
    const groupId = findGroupIdByHref(activeHref);
    if (groupId) setOpenGroupId(groupId);
  }, [activeHref]);

  const toggleGroup = React.useCallback(
    (id: string) => setOpenGroupId((prev) => (prev === id ? null : id)),
    [],
  );

  const width = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: widthTransition(isCollapsed),
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: widthTransition(isCollapsed),
        },
      }}
    >
      <Stack
        direction={isCollapsed ? "column" : "row"}
        alignItems="center"
        justifyContent={isCollapsed ? "center" : "space-between"}
        spacing={isCollapsed ? 1 : 0}
        sx={{
          px: isCollapsed ? 0 : 2,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Image src="/icon.svg" alt="FlowX logo" width={40} height={40} />
          {!isCollapsed && (
            <Typography variant="subtitle1" fontWeight={600}>
              FlowX
            </Typography>
          )}
        </Stack>
        <IconButton
          size="small"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </IconButton>
      </Stack>

      <Box
        component="nav"
        aria-label="Main navigation"
        sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
      >
        <List
          sx={{ pt: isCollapsed ? 1 : 0 }}
          subheader={
            isCollapsed ? undefined : (
              <ListSubheader component="div">Menu</ListSubheader>
            )
          }
        >
          {menuItems.map((entry) => (
            <SidebarNavItem
              key={entry.id}
              entry={entry}
              collapsed={isCollapsed}
              activeHref={activeHref}
              open={openGroupId === entry.id}
              onToggle={toggleGroup}
            />
          ))}
        </List>
      </Box>

      <SidebarUserFooter
        fullName={fullName}
        email={email}
        collapsed={isCollapsed}
        onClick={() => setLogoutOpen(true)}
      />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </Drawer>
  );
}
