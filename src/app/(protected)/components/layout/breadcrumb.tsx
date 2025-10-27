"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography } from "@mui/material";
import { Slash } from "lucide-react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  // Split path into parts
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  // Helper to create path URL for each crumb
  const buildHref = (index: number) =>
    "/" + pathSegments.slice(0, index + 1).join("/");

  if (pathSegments.length === 0) return null; // don't show on homepage

  return (
    <MUIBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        color="inherit"
        underline="hover"
        onClick={() => router.push("/dashboard")}
        sx={{ cursor: "pointer" }}
      >
        Dashboard
      </Link>

      {pathSegments.map((segment, index) => {
        const href = buildHref(index);
        const isLast = index === pathSegments.length - 1;

        // Capitalize each segment
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);

        return isLast ? (
          <Typography key={href} color="text.primary">
            {label}
          </Typography>
        ) : (
          <Link
            key={href}
            color="inherit"
            underline="hover"
            onClick={() => router.push(href)}
            sx={{ cursor: "pointer" }}
          >
            {label}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
  );
}
