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
import idsrvApiService from "@/services/apiServices/idsrv/idsrvApiService";
import { UserModel } from "@/services/apiServices/idsrv/interface/UserModel";

function UserList() {
  const confirm = useConfirm();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    data: userList,
    isLoading,
    isFetching,
    error,
    refetch: refetchUsers,
  } = idsrvApiService.useGetUsers({
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

  const { mutateAsync } = idsrvApiService.useDeleteUser();

  const handleDelete = (id: string) => {
    confirm({
      onConfirm: async () => {
        await mutateAsync(id, {
          onSuccess: () => {
            toast.error("User Deleted Sucessfully !");
            refetchUsers();
          },
          onError: () => {
            toast.error("Error Occured  !");
          },
        });
      },
    });
  };

  const apiUserColumns: ColumnDef<UserModel>[] = [
    {
      header: "Name",
      cell: ({ row }) => (
        <>{row.original.first_name + " " + row.original.last_name}</>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone Number",
      accessorKey: "phone_number",
    },

    {
      header: "Action",
      cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Link
            href={
              routes["(protected)"]["user-management"].user.edit.index +
              "/" +
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
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Users
        </Typography>
        <Link href={routes["(protected)"]["user-management"]["user"].add.index}>
          <Button variant="contained" color="primary">
            Add User
          </Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={apiUserColumns}
        data={userList?.items || []}
        refetchData={refetchUsers}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: userList?.totalCount || 0,
          handlePageChange,
          handleRowsPerPageChange,
        }}
      />
    </Paper>
  );
}

export default UserList;
