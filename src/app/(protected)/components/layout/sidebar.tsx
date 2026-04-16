"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Database,
  Layers,
  House,
  Activity,
  CornerDownRight,
  FlaskConical,
  Stethoscope,
} from "lucide-react";
import SettingsInputCompositeIcon from "@mui/icons-material/SettingsInputComposite";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import {
  Button,
  Drawer,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { routes } from "@/app/routes.generated";
import { useDispatch, useSelector } from "react-redux";
import { signoutRedirect } from "@/services/authService";
import { useGetUserInfo } from "@/hooks/useGetUserInfo";
import { useAuth } from "@/lib/auth/useAuth";
interface MenuItem {
  id: string;
  label: string;
  link?: string;
  icon: React.ElementType;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", link: "/dashboard", icon: House },
  {
    id: "api-gateway",
    label: "API Gateway",
    icon: Layers,
    subItems: [
      {
        id: "route",
        label: "Route",
        link: "/api-gateway/route",
        icon: CornerDownRight,
      },
      {
        id: "cluster",
        label: "Cluster",
        link: "/api-gateway/cluster",
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "webSocket",
    label: "Sockets",
    icon: ElectricalServicesIcon,
    subItems: [
      {
        id: "signalR",
        label: "SignalR Hubs",
        link: "/sockets/signalR",
        icon: CornerDownRight,
      },
      {
        id: "webSocket",
        label: "Web Sockets",
        link: "/sockets/web-socket",
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "httpProxy",
    label: "Http Proxy",
    icon: SettingsInputCompositeIcon,
    subItems: [
      {
        id: "restBuilder",
        label: "Rest Builder",
        link: "/proxy/rest-builder",
        icon: CornerDownRight,
      },
      {
        id: "soapBuilder",
        label: "Soap Builder",
        link: "/proxy/soap-builder",
        icon: CornerDownRight,
      },
    ],
  },

  {
    id: "config",
    label: "Configure",
    icon: SettingsIcon,
    subItems: [
      {
        id: "identity-config",
        label: "Identity Server",
        link: `${routes["(protected)"].configure.index}`,
        icon: CornerDownRight,
      },
      {
        id: "ssl-certificate",
        label: "SSL Certificate",
        link: `${routes["(protected)"].configure["ssl-certificate"].index}`,
        icon: CornerDownRight,
      },
      {
        id: "ca-certificate",
        label: "CA Certificate",
        link: `${routes["(protected)"].configure["ca-certificate"].index}`,
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: SettingsIcon,
    subItems: [
      {
        id: "api-user",
        label: "API Users",
        link: `${routes["(protected)"]["user-management"]["api-user"].index}`,
        icon: CornerDownRight,
      },
      {
        id: "app-user",
        label: "System Users",
        link: `${routes["(protected)"]["user-management"].user.index}`,
        icon: CornerDownRight,
      },
      {
        id: "app-user-roles",
        label: "Roles",
        link: `${routes["(protected)"]["user-management"].role.index}`,
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: SettingsIcon,
    subItems: [
      {
        id: "api-product",
        label: "API Products",
        link: `${routes["(protected)"]["product-management"]["api-product"].index}`,
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "playground",
    label: "Playground",
    icon: FlaskConical,
    subItems: [
      {
        id: "code-editor",
        label: "Code Editor",
        link: "/playground/code-editor",
        icon: CornerDownRight,
      },

      {
        id: "json-formatter",
        label: "JSON Formatter",
        link: "/playground/json-formatter",
        icon: CornerDownRight,
      },
      {
        id: "api-tester",
        label: "API Tester",
        link: "/playground/api-tester",
        icon: CornerDownRight,
      },
      {
        id: "jwt-inspector",
        label: "JWT Inspector",
        link: "/playground/jwt-inspector",
        icon: CornerDownRight,
      },
    ],
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: Stethoscope,
    subItems: [
      {
        id: "network-logs",
        label: "Network Logs",
        link: "/diagnose/network-logs",
        icon: CornerDownRight,
      },
    ],
  },
];

export function SideBar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("home");
  const [openItem, setOpenItem] = React.useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const dispatch = useDispatch();
  const handleItemClick = (itemId: string, hasSubItems: boolean) => {
    setActiveItem(itemId);
    if (hasSubItems) {
      setOpenItem(openItem === itemId ? null : itemId);
    }
  };
  const { logout } = useAuth();

  const { fullName, email } = useGetUserInfo();
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Drawer
      variant="permanent"
      // ✅ Remove open prop — useless on permanent variant
      sx={{
        width: !isCollapsed ? 300 : 80,
        flexShrink: 0,
        whiteSpace: "nowrap",
        // ✅ Remove transition from wrapper — only paper needs it
        "& .MuiDrawer-paper": {
          width: !isCollapsed ? 300 : 80,
          boxSizing: "border-box",
          overflowX: "hidden",
          // ✅ Use correct duration per direction
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: isCollapsed
                ? theme.transitions.duration.leavingScreen // collapsing
                : theme.transitions.duration.enteringScreen, // expanding
            }),
        },
      }}
    >
      <div
        className={`py-4 border-b border-sidebar-border flex ${isCollapsed ? "flex-col gap-3 px-1" : "items-center justify-between px-4"}`}
      >
        <div className="flex items-center gap-2">
          <img
            src="/icon.svg"
            alt="Logo"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <span
            className="font-semibold text-sidebar-foreground whitespace-nowrap"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.2s, width 0.3s",
              width: isCollapsed ? 0 : "60px",
              overflow: "hidden",
            }}
          >
            Tee Hee
          </span>
        </div>
        <Button
          variant="text"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300"
          sx={{ minWidth: "auto", p: 1 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <List
        component="nav"
        aria-labelledby="sidebar-menu"
        subheader={
          <ListSubheader
            component="div"
            id="sidebar-menu"
            sx={{ opacity: isCollapsed ? 0 : 1, transition: "opacity 0.3s" }}
          >
            Menu
          </ListSubheader>
        }
      >
        {menuItems.map(({ id, label, link, icon: Icon, subItems }) => {
          const isActive = activeItem === id;
          const isOpen = openItem === id;

          return (
            <React.Fragment key={id}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleItemClick(id, !!subItems)}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? "center" : "initial",
                  px: 2.5,
                }}
              >
                {link ? (
                  <Link
                    href={link}
                    className={`flex items-center gap-3 w-full ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 3,
                        justifyContent: "center",
                        transition: "margin 0.3s",
                      }}
                    >
                      <Icon
                        className={`flex-shrink-0 ${isCollapsed ? "w-6 h-6" : "w-4 h-4"}`}
                        style={{ transition: "width 0.3s, height 0.3s" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      sx={{
                        opacity: isCollapsed ? 0 : 1,
                        transition: "opacity 0.3s",
                      }}
                    />
                  </Link>
                ) : (
                  <>
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: isCollapsed ? 0 : 3,
                        justifyContent: "center",
                        transition: "margin 0.3s",
                      }}
                    >
                      <Icon
                        className={`flex-shrink-0 ${isCollapsed ? "w-6 h-6" : "w-4 h-4"}`}
                        style={{ transition: "width 0.3s, height 0.3s" }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      sx={{
                        opacity: isCollapsed ? 0 : 1,
                        transition: "opacity 0.3s",
                      }}
                    />
                    {subItems && (
                      <div
                        style={{
                          opacity: isCollapsed ? 0 : 1,
                          transition: "opacity 0.3s",
                        }}
                      >
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </ListItemButton>

              {subItems && (
                <Collapse
                  in={isOpen && !isCollapsed}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {subItems.map((sub) => (
                      <ListItemButton key={sub.id} sx={{ pl: 4 }}>
                        <Link
                          href={sub.link || "#"}
                          className="flex items-center gap-3 w-full"
                        >
                          <ListItemIcon>
                            <sub.icon className="w-4 h-4" />
                          </ListItemIcon>
                          <ListItemText primary={sub.label} />
                        </Link>
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      <Box
        sx={{
          opacity: isCollapsed ? 0 : 1,
          transition: "opacity 0.3s",
          pointerEvents: isCollapsed ? "none" : "auto",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={() => setLogoutOpen(true)}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.75rem",
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap fontWeight={500}>
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {email}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" onClick={logout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
