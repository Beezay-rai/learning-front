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
  SmileIcon,
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
import { setOIDCUser, UserDetail } from "@/common/store/appSlices";
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
        id: "ssl-certificate",
        label: "SSL Certificate",
        link: "/proxy/rest-builder",
        icon: CornerDownRight,
      },
      {
        id: "ca-certificate",
        label: "CA Certificate",
        link: "/configure/ca-certificate",
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

  const oidc_user: UserDetail = useSelector((state: any) => state.userDetail);
  const name = oidc_user?.oidc_user?.profile?.name ?? "User";
  const email = oidc_user?.oidc_user?.profile?.email ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await signoutRedirect();
      dispatch(setOIDCUser(null));
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <Drawer
      variant="permanent"
      open={!isCollapsed}
      sx={{
        width: !isCollapsed ? 300 : 110, // 240px when open, 80px when collapsed
        "& .MuiDrawer-paper": {
          width: !isCollapsed ? 300 : 110, // Ensure the paper element matches
          boxSizing: "border-box",
        },
      }}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <SmileIcon></SmileIcon>
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Tee Hee
            </span>
          </div>
        )}
        <Button
          variant="text"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
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
          !isCollapsed && (
            <ListSubheader component="div" id="sidebar-menu">
              Menu
            </ListSubheader>
          )
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
              >
                {link ? (
                  <Link href={link} className="flex items-center gap-3 w-full">
                    <ListItemIcon>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={label} />}
                  </Link>
                ) : (
                  <>
                    <ListItemIcon>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={label} />}
                    {!isCollapsed &&
                      subItems &&
                      (isOpen ? <ChevronUp /> : <ChevronDown />)}
                  </>
                )}
              </ListItemButton>

              {!isCollapsed && subItems && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
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

      {!isCollapsed && (
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
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {email}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
