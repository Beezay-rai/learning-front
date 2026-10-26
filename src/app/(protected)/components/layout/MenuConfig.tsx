import {
  Cable,
  FlaskConical,
  GitBranch,
  House,
  Layers,
  Package,
  Plug,
  Settings,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/app/routes.generated";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavLeaf extends NavLink {
  id: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavLink[];
}

export type NavEntry = NavLeaf | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup =>
  "children" in entry;

const protectedRoutes = routes["(protected)"];
const configure = protectedRoutes.configure;
const userManagement = protectedRoutes["user-management"];

export const menuItems: NavEntry[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: House },
  {
    id: "api-gateway",
    label: "API Gateway",
    icon: Layers,
    children: [
      { label: "Route", href: "/api-gateway/route" },
      { label: "Cluster", href: "/api-gateway/cluster" },
    ],
  },
  {
    id: "sockets",
    label: "Sockets",
    icon: Plug,
    children: [
      { label: "SignalR Hubs", href: "/sockets/signalR" },
      { label: "Web Sockets", href: "/sockets/web-socket" },
    ],
  },
  {
    id: "http-proxy",
    label: "Http Proxy",
    icon: Cable,
    children: [
      { label: "Rest Builder", href: "/proxy/rest-builder" },
      { label: "Soap Builder", href: "/proxy/soap-builder" },
    ],
  },
  {
    id: "configure",
    label: "Configure",
    icon: Settings,
    children: [
      { label: "Identity Server", href: configure.idsrv.index },
      { label: "SSL Certificate", href: configure["ssl-certificate"].index },
      { label: "CA Certificate", href: configure["ca-certificate"].index },
      // NOTE: "/workflow" is also the target of "State Machines" below.
      // Both entries will highlight together; consider removing one.
      { label: "Step Flows", href: "/workflow" },
    ],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: Users,
    children: [
      { label: "API Users", href: userManagement["api-user"].index },
      { label: "System Users", href: userManagement.user.index },
      { label: "Roles", href: userManagement.role.index },
    ],
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: GitBranch,
    children: [{ label: "State Machines", href: protectedRoutes.workflow.index }],
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: Package,
    children: [
      {
        label: "API Products",
        href: protectedRoutes["product-management"]["api-product"].index,
      },
    ],
  },
  {
    id: "playground",
    label: "Playground",
    icon: FlaskConical,
    children: [
      { label: "Code Editor", href: "/playground/code-editor" },
      { label: "JSON Formatter", href: "/playground/json-formatter" },
      { label: "API Tester", href: "/playground/api-tester" },
      { label: "JWT Inspector", href: "/playground/jwt-inspector" },
    ],
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: Stethoscope,
    children: [{ label: "Network Logs", href: "/diagnose/network-logs" }],
  },
];

const allHrefs = (entry: NavEntry): string[] =>
  isGroup(entry) ? entry.children.map((c) => c.href) : [entry.href];

/**
 * Returns the most specific nav href matching the pathname, so that
 * "/configure/idsrv" doesn't also light up for certificate pages.
 */
export function findActiveHref(pathname: string): string | null {
  let best: string | null = null;

  for (const entry of menuItems) {
    for (const href of allHrefs(entry)) {
      const base = href.replace(/\/$/, "");
      const matches = pathname === base || pathname.startsWith(`${base}/`);
      if (matches && (best === null || base.length > best.length)) {
        best = href;
      }
    }
  }
  return best;
}

export function findGroupIdByHref(href: string | null): string | null {
  if (!href) return null;
  const group = menuItems.find(
    (e) => isGroup(e) && e.children.some((c) => c.href === href),
  );
  return group?.id ?? null;
}