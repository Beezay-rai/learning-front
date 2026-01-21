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
import { RestApiBuilderModel } from "@/services/apiServices/core/interface/RestApiBuilderModel";
import useConfirm from "@/hooks/useConfirm";
import { toast } from "react-toastify";
import { ApiUserModel } from "@/services/apiServices/core/interface/ApiUserModel";
import useCoreApiService from "@/services/apiServices/core/useCoreApiService";

function ApiUserList() {
  const confirm = useConfirm();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { useGetApiUsers, useDeleteRestApiBuilder } = useCoreApiService();
  const {
    data: apiUserList,
    isLoading,
    isFetching,
    error,
    refetch: refetchApiUsers,
  } = useGetApiUsers({
    page: page + 1,
    pageSize: rowsPerPage,
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { mutateAsync } = useDeleteRestApiBuilder();

  const handleDelete = (id: number) => {
    confirm({
      onConfirm: async () => {
        await mutateAsync(id, {
          onSuccess: () => {
            toast.error("API Deleted Sucessfully !");
            refetchApiUsers();
          },
          onError: () => {
            toast.error("Error Occured  !");
          },
        });
      },
    });
  };

  const apiUserColumns: ColumnDef<ApiUserModel>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },

    {
      header: "Action",
      cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Link
            href={
              routes["(protected)"]["user-management"]["api-user"].edit.index +
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
          API Users
        </Typography>
        <Link
          href={routes["(protected)"]["user-management"]["api-user"].add.index}
        >
          <Button variant="contained" color="primary">
            Add Api User
          </Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={apiUserColumns}
        data={apiUserList?.data?.items || []}
        refetchData={refetchApiUsers}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: apiUserList?.data?.totalCount || 0,
          handlePageChange,
          handleRowsPerPageChange,
        }}
      />
    </Paper>
  );
}

export default ApiUserList;
