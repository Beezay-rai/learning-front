"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popover,
  Tooltip,
} from "@mui/material";
import type { LucideIcon } from "lucide-react";
import {
  isGroup,
  type NavEntry,
  type NavGroup,
  type NavLeaf,
  type NavLink,
} from "./MenuConfig";

const rowSx = (collapsed: boolean) => ({
  minHeight: 48,
  mx: 1,
  mb: 0.25,
  borderRadius: 1,
  px: collapsed ? 0 : 2,
  justifyContent: collapsed ? "center" : "flex-start",
});

function EntryIcon({
  icon: Icon,
  collapsed,
}: {
  icon: LucideIcon;
  collapsed: boolean;
}) {
  return (
    <ListItemIcon
      sx={{
        minWidth: 0,
        mr: collapsed ? 0 : 2,
        justifyContent: "center",
        color: "inherit",
      }}
    >
      <Icon size={collapsed ? 22 : 18} />
    </ListItemIcon>
  );
}

function SubLink({
  link,
  active,
  onNavigate,
}: {
  link: NavLink;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ListItemButton
      component={Link}
      href={link.href}
      selected={active}
      onClick={onNavigate}
      sx={{ mx: 1, pl: 4, borderRadius: 1 }}
    >
      <ListItemIcon sx={{ minWidth: 28, color: "inherit" }}>
        <CornerDownRight size={16} />
      </ListItemIcon>
      <ListItemText primary={link.label} />
    </ListItemButton>
  );
}

function LeafItem({
  item,
  collapsed,
  active,
}: {
  item: NavLeaf;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Tooltip title={collapsed ? item.label : ""} placement="right">
      <ListItemButton
        component={Link}
        href={item.href}
        selected={active}
        sx={rowSx(collapsed)}
      >
        <EntryIcon icon={item.icon} collapsed={collapsed} />
        {!collapsed && <ListItemText primary={item.label} />}
      </ListItemButton>
    </Tooltip>
  );
}

function GroupItem({
  group,
  collapsed,
  activeHref,
  open,
  onToggle,
}: {
  group: NavGroup;
  collapsed: boolean;
  activeHref: string | null;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const isActive = group.children.some((c) => c.href === activeHref);

  // Close the flyout if the sidebar is expanded while it's open.
  React.useEffect(() => {
    if (!collapsed) setAnchorEl(null);
  }, [collapsed]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (collapsed) setAnchorEl(e.currentTarget);
    else onToggle(group.id);
  };

  const closeFlyout = () => setAnchorEl(null);

  return (
    <>
      <Tooltip
        title={collapsed && !anchorEl ? group.label : ""}
        placement="right"
      >
        <ListItemButton
          onClick={handleClick}
          selected={isActive && (collapsed || !open)}
          aria-expanded={collapsed ? Boolean(anchorEl) : open}
          sx={rowSx(collapsed)}
        >
          <EntryIcon icon={group.icon} collapsed={collapsed} />
          {!collapsed && (
            <>
              <ListItemText primary={group.label} />
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </>
          )}
        </ListItemButton>
      </Tooltip>

      {/* Expanded sidebar: inline accordion */}
      {!collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {group.children.map((child) => (
              <SubLink
                key={child.href}
                link={child}
                active={child.href === activeHref}
              />
            ))}
          </List>
        </Collapse>
      )}

      {/* Collapsed sidebar: flyout menu next to the icon */}
      {collapsed && (
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={closeFlyout}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ "& .MuiPopover-paper": { ml: 1, minWidth: 220 } }}
        >
          <List
            disablePadding
            subheader={<ListSubheader component="div">{group.label}</ListSubheader>}
          >
            {group.children.map((child) => (
              <SubLink
                key={child.href}
                link={child}
                active={child.href === activeHref}
                onNavigate={closeFlyout}
              />
            ))}
          </List>
        </Popover>
      )}
    </>
  );
}

interface SidebarNavItemProps {
  entry: NavEntry;
  collapsed: boolean;
  activeHref: string | null;
  open: boolean;
  onToggle: (id: string) => void;
}

export function SidebarNavItem({
  entry,
  collapsed,
  activeHref,
  open,
  onToggle,
}: SidebarNavItemProps) {
  if (isGroup(entry)) {
    return (
      <GroupItem
        group={entry}
        collapsed={collapsed}
        activeHref={activeHref}
        open={open}
        onToggle={onToggle}
      />
    );
  }
  return (
    <LeafItem
      item={entry}
      collapsed={collapsed}
      active={entry.href === activeHref}
    />
  );
}