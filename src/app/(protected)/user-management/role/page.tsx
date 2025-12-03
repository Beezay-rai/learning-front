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
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "@/components/ui/table/DataTable";
import { RestApiBuilderModel } from "@/services/apiServices/core/interface/RestApiBuilderModel";
import useConfirm from "@/hooks/useConfirm";
import { toast } from "react-toastify";
import idsrvApiService from "@/services/apiServices/idsrv/idsrvApiService";
import { RoleModel } from "@/services/apiServices/idsrv/interface/RoleModel";
import { useState } from "react";
import { CORE_ADMIN } from "@/services/apiServices/idsrv/constants/core-admin";

function RoleList() {
  const confirm = useConfirm();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {
    data: roleList,
    isLoading,
    isFetching,
    error,
    refetch: refetchRoles,
  } = idsrvApiService.useGetRoles({
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

  const { mutateAsync } = idsrvApiService.useDeleteRole();

  const handleDelete = (id: string) => {
    confirm({
      onConfirm: async () => {
        await mutateAsync(id, {
          onSuccess: () => {
            toast.error("Role Deleted Sucessfully !");
            refetchRoles();
          },
          onError: () => {
            toast.error("Error Occured  !");
          },
        });
      },
    });
  };

  const roleColumns: ColumnDef<RoleModel>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "User Type",
      accessorKey: "userType",
    },
    {
      header: "Description",
      accessorKey: "description",
    },

    {
      header: "Action",
      cell: ({ row }) =>
        row.original.id !== CORE_ADMIN.id && (
          <Stack direction="row" spacing={1}>
            <Link
              href={
                routes["(protected)"]["user-management"].role.edit.index +
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
          Application Roles
        </Typography>
        <Link href={routes["(protected)"]["user-management"].role.add.index}>
          <Button variant="contained" color="primary">
            Add Role
          </Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={roleColumns}
        data={roleList?.items || []}
        refetchData={refetchRoles}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: roleList?.totalCount || 0,
          handlePageChange,
          handleRowsPerPageChange,
        }}
      />
    </Paper>
  );
}

export default RoleList;
