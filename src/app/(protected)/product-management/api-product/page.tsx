"use client";

import {
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LayersIcon from "@mui/icons-material/Layers";
import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import { routes } from "@/app/routes.generated";

import { toast } from "react-toastify";
import useOrchestratorApiService, {
  Product,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";

function ApiProductPage() {
  const confirm = useConfirm();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { useGetApiProducts, useDeleteApiProduct } =
    useOrchestratorApiService();

  const {
    data: productList,
    isLoading,
    isRefetching,
    refetch,
  } = useGetApiProducts({ page, size: rowsPerPage });

  const { mutateAsync: deleteProduct } = useDeleteApiProduct();

  const handleDelete = (id: number) => {
    confirm({
      onConfirm: async () => {
        await deleteProduct(id, {
          onSuccess: () => {
            toast.success("Product deleted successfully");
            refetch();
          },
        });
      },
    });
  };

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "created_Date",
      header: "Created Date",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-CA"),
    },
    {
      accessorKey: "updated_Date",
      header: "Updated Date",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-CA"),
    },
    {
      header: "Action",
      cell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        return (
          <>
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              {/* Edit */}
              <MenuItem>
                <Link
                  href={
                    routes["(protected)"]["product-management"]["api-product"]
                      .index + row.original.id
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </Link>
              </MenuItem>

              {/* Versions */}
              <MenuItem>
                <Link
                  href={
                    routes["(protected)"]["product-management"]["api-product"]
                      .index + row.original.id
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ListItemIcon>
                    <LayersIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Versions</ListItemText>
                </Link>
              </MenuItem>

              {/* Delete */}
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  handleDelete(row.original.id);
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">API Products</Typography>

        <Link
          href={
            routes["(protected)"]["product-management"]["api-product"].add.index
          }
        >
          <Button variant="contained">Add Product</Button>
        </Link>
      </Box>

      <DataTable
        isLoading={isLoading || isRefetching}
        data={productList?.data.items || []}
        columns={columns}
        refetchData={refetch}
      />

      <TablePagination
        component="div"
        count={productList?.data.total ?? 0}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
      />
    </Paper>
  );
}

export default ApiProductPage;
