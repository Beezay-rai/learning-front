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
import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/services/apiServices/api-gateway/interfaces/Route";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "@/components/ui/table/DataTable";
import coreApiService from "@/services/apiServices/core/coreApiService";
import { RestApiBuilderModel } from "@/services/apiServices/core/interface/RestApiBuilderModel";
import useConfirm from "@/hooks/useConfirm";
import { toast } from "react-toastify";

function RestApiBuilderList() {
  const confirm = useConfirm();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const {
    data: restApiList,
    isLoading,
    isFetching,
    error,
    refetch: refetchApiList,
  } = coreApiService.useGetRestApiBuilders();

  const handlePageChange = (e: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const { mutateAsync } = coreApiService.useDeleteRestApiBuilder();

  const handleDelete = (id: number) => {
    confirm({
      onConfirm: async () => {
        await mutateAsync(id, {
          onSuccess: () => {
            toast.error("API Deleted Sucessfully !");
            refetchApiList();
          },
          onError: () => {
            toast.error("Error Occured  !");
          },
        });
      },
    });
  };

  const routeColumns: ColumnDef<RestApiBuilderModel>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      accessorKey: "url",
      header: "url",
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: (info) => {
        const method = info.getValue() as string;
        let color:
          | "primary"
          | "secondary"
          | "success"
          | "error"
          | "warning"
          | "info" = "primary";
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
        return <Chip key={method} label={method} color={color} size="small" />;
      },
    },

    {
      accessorKey: "isDeleted",
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outlined" color="error" label="Deleted"></Chip>
        ) : (
          <Chip variant="outlined" color="success" label="Active" />
        ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: (info) => {
        const value = info.getValue() as string;
        return value === "0001-01-01T00:00:00"
          ? "-"
          : new Date(value).toLocaleDateString("en-CA");
      },
    },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "updatedDate",
      header: "Updated Date",
      cell: (info) => {
        const value = info.getValue() as string;
        return value === "0001-01-01T00:00:00"
          ? "-"
          : new Date(value).toLocaleDateString("en-CA");
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Link
            href={
              routes["(protected)"].proxy["rest-builder"].edit.index +
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
            onClick={() => handleDelete(row.original.id)}
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
          Rest Api Builder
        </Typography>
        <Link href={routes["(protected)"].proxy["rest-builder"].add.index}>
          <Button variant="contained" color="primary">
            Add Rest Api
          </Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={routeColumns}
        refetchData={refetchApiList}
        data={restApiList?.items || []}
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

export default RestApiBuilderList;
