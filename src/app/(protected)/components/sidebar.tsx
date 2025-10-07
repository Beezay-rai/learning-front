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
} from "lucide-react";
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
      { id: "route", label: "Route", link: "/api-gateway/route", icon: Layers },
      {
        id: "cluster",
        label: "Cluster",
        link: "/api-gateway/cluster",
        icon: Layers,
      },
    ],
  },
  { id: "webSocket", label: "Web Socket", icon: Layers },
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
              <Database className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Dashboard
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
