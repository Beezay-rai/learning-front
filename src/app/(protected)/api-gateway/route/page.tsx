"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Skeleton,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/api/api-gateway/apiService";
import DataTable from "@/components/dataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/api/api-gateway/interfaces/route";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function RoutePage() {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: routeList, isLoading, error } = apiService.useGetRoutes();

  const handlePageChange = (e: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const routeColumns: ColumnDef<Route>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "clusterId",
      header: "Cluster ID",
    },
    {
      accessorKey: "methods",
      header: "Methods",
      cell: (info) => {
        const methods = info.getValue() as string[];

        if (!methods?.length) return "N/A";

        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, max-content)",
              gap: 0.5,
            }}
          >
            {methods.map((method) => {
              let color:
                | "primary"
                | "secondary"
                | "success"
                | "error"
                | "warning"
                | "info" = "primary";

              // Example color mapping
              switch (method.toUpperCase()) {
                case "GET":
                  color = "success";
                  break;
                case "POST":
                  color = "primary";
                  break;
                case "PUT":
                  color = "warning";
                  break;
                case "PATCH":
                  color = "warning";
                  break;
                case "DELETE":
                  color = "error";
                  break;
                default:
                  color = "info";
              }

              return (
                <Chip key={method} label={method} color={color} size="small" />
              );
            })}
          </Box>
        );
      },
    },
    {
      accessorKey: "path",
      header: "Path",
    },
    {
      accessorKey: "deleted_Status",
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outlined" color="error" label="Deleted"></Chip>
        ) : (
          <Chip variant="outlined" color="success" label="Active" />
        ),
    },
    {
      accessorKey: "deleted_date",
      header: "Deleted Date",
      cell: (info) => {
        const value = info.getValue() as string;
        return value === "0001-01-01T00:00:00"
          ? "N/A"
          : new Date(value).toLocaleDateString();
      },
    },
    {
      accessorKey: "deleted_By",
      header: "Deleted By",
      cell: (info) => info.getValue() || "N/A",
    },
    {
      accessorKey: "created_By",
      header: "Created By",
      cell: (info) => info.getValue() || "N/A",
    },
    {
      accessorKey: "created_date",
      header: "Created Date",
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "updated_By",
      header: "Updated By",
      cell: (info) => info.getValue() || "N/A",
    },
    {
      accessorKey: "updated_Date",

      header: "Updated Date",
      cell: (info) => {
        const value = info.getValue() as string;
        return value === "0001-01-01T00:00:00"
          ? "N/A"
          : new Date(value).toLocaleDateString();
      },
    },

    {
      header: "Action",
      cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Link
            href={
              routes["(protected)"]["api-gateway"].route.edit.index +
              row.original.id
            }
          >
            <IconButton color="primary" size="small">
              <EditIcon />
            </IconButton>
          </Link>

          <IconButton
            color="error"
            size="small"
            onClick={() => {
              // handle delete logic here (e.g., open confirm dialog)
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Routes
        </Typography>
        <Link href={routes["(protected)"]["api-gateway"].route.add.index}>
          <Button variant="contained" color="primary">
            Add Route
          </Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading}
        columns={routeColumns}
        data={routeList?.items || []}
      />

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}

export default RoutePage;
