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
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { routes } from "@/app/routes.generated";
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
        link: "/configure/ca-certificate",
        icon: CornerDownRight,
      },
    ],
  },
];

export function SideBar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("home");
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  const handleItemClick = (itemId: string, hasSubItems: boolean) => {
    setActiveItem(itemId);
    if (hasSubItems) {
      setOpenItem(openItem === itemId ? null : itemId);
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
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                JD
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                john@example.com
              </p>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
