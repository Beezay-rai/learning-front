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
import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/services/apiServices/api-gateway/interfaces/route";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "@/components/ui/table/DataTable";
import { RestApiBuilderModel } from "@/services/apiServices/core/interface/restApiBuilderModel";
import useConfirm from "@/hooks/useConfirm";
import { toast } from "react-toastify";
import { ApiUserModel } from "@/services/apiServices/core/interface/apiUserModel";
import { UserModel } from "@/services/apiServices/idsrv/interface/UserModel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";
function UserList() {
  const confirm = useConfirm();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { useGetUsers, useDeleteUser } = useIdsrvService();
  const {
    data: userList,
    isLoading,
    isFetching,
    error,
    refetch: refetchUsers,
  } = useGetUsers({
    page: page + 1,
    pageSize: rowsPerPage,
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { mutateAsync } = useDeleteUser();

  const handleDelete = (id: number) => {
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

  const userColumns: ColumnDef<UserModel>[] = [
    {
      header: "Name",
      cell: ({ row }) => (
        <>{row.original.first_name + " " + row.original.last_name}</>
      ),
    },
    {
      header: "User Type",
      accessorKey: "user_type",
    },
    {
      header: "Role",
      accessorKey: "role_name",
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
      header: "Email Confirmed",
      accessorKey: "email_confirmed",
      cell: ({ getValue }) => {
        const confirmed = getValue<boolean>();
        return confirmed ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <CloseIcon color="error" fontSize="small" />
        );
      },
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
            onClick={() => handleDelete(Number(row.original.id))}
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
        columns={userColumns}
        data={userList?.data?.items || []}
        refetchData={refetchUsers}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: userList?.data?.totalCount || 0,
          handlePageChange,
          handleRowsPerPageChange,
        }}
      />
    </Paper>
  );
}

export default UserList;
