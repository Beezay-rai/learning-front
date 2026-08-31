"use client";

import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  InputBase,
  alpha,
} from "@mui/material";
import {
  Bell,
  Search,
  Settings,
  HelpCircle,
  User,
  LogOut,
} from "lucide-react";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useAuth } from "@/lib/auth/useAuth";

export function TopBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] =
    React.useState<null | HTMLElement>(null);
  const { fullName, email } = useGetUserInfo();
  const { logout } = useAuth();

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side - Search */}
        <Box
          sx={{
            position: "relative",
            borderRadius: 1,
            backgroundColor: (theme) =>
              alpha(theme.palette.common.black, 0.05),
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.common.black, 0.08),
            },
            marginLeft: 0,
            width: { xs: "100%", sm: "auto" },
            maxWidth: { sm: 400 },
          }}
        >
          <Box
            sx={{
              padding: (theme) => theme.spacing(0, 2),
              height: "100%",
              position: "absolute",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search className="w-5 h-5 text-gray-500" />
          </Box>
          <InputBase
            placeholder="Search..."
            sx={{
              color: "inherit",
              width: "100%",
              "& .MuiInputBase-input": {
                padding: (theme) => theme.spacing(1, 1, 1, 0),
                paddingLeft: (theme) => `calc(1em + ${theme.spacing(4)})`,
                transition: (theme) => theme.transitions.create("width"),
                width: { xs: "100%", sm: "30ch" },
              },
            }}
          />
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Help Icon */}
          <IconButton
            size="large"
            aria-label="help"
            color="inherit"
            sx={{ "&:hover": { backgroundColor: "action.hover" } }}
          >
            <HelpCircle className="w-5 h-5" />
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ "&:hover": { backgroundColor: "action.hover" } }}
          >
            <Badge badgeContent={3} color="error">
              <Bell className="w-5 h-5" />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            size="large"
            aria-label="settings"
            color="inherit"
            sx={{ "&:hover": { backgroundColor: "action.hover" } }}
          >
            <Settings className="w-5 h-5" />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User Profile */}
          <IconButton
            size="small"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            sx={{ p: 0.5 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.875rem",
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          id="notifications-menu"
          anchorEl={notificationsAnchor}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxHeight: 400,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationsClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                New route added
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 minutes ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Cluster updated successfully
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 hour ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                System maintenance scheduled
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleNotificationsClose}
            sx={{ justifyContent: "center" }}
          >
            <Typography variant="body2" color="primary" fontWeight={500}>
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
