"use client";

import {
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import { toast } from "react-toastify";

import useOrchestratorApiService, {
  ProductApiEndpoint,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import ProductApiEndpointModal from "./ProductApiEndPointModal";

function ProductApiEndpointPage() {
  const { id: productId, versionId } = useParams<{
    id: string;
    versionId: string;
  }>();

  const confirm = useConfirm();

  const [modal, setModal] = useState<{
    open: boolean;
    selected?: ProductApiEndpoint | null;
  }>({ open: false });

  const { useGetProductApiEndpoints, useDeleteProductApiEndpoint } =
    useOrchestratorApiService();

  const { data, isLoading, refetch } = useGetProductApiEndpoints(
    Number(productId),
    Number(versionId),
  );

  const { mutateAsync: deleteEndpoint } = useDeleteProductApiEndpoint();

  const columns: ColumnDef<ProductApiEndpoint>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "apiPath", header: "API Path" },
    {
      accessorKey: "isEnabled",
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Chip color="success" label="Enabled" />
        ) : (
          <Chip color="error" label="Disabled" />
        ),
    },
    {
      accessorKey: "isDeprecated",
      header: "Deprecated",
      cell: (info) =>
        info.getValue() ? (
          <Chip color="warning" label="Yes" />
        ) : (
          <Chip label="No" />
        ),
    },
    {
      header: "Action",
      cell: ({ row }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

        return (
          <>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setModal({ open: true, selected: row.original });
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  confirm({
                    onConfirm: async () => {
                      await deleteEndpoint({
                        id: row.original.id,
                        productId: Number(productId),
                        versionId: Number(versionId),
                      });
                      toast.success("Endpoint deleted");
                      refetch();
                    },
                  });
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
        <Typography variant="h6">Product Version Endpoints</Typography>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setModal({ open: true })}
        >
          Add Endpoint
        </Button>
      </Box>

      <DataTable
        isLoading={isLoading}
        data={data?.data || []}
        columns={columns}
        refetchData={refetch}
      />

      {modal.open && (
        <ProductApiEndpointModal
          open={modal.open}
          defaultValue={modal.selected}
          productId={Number(productId)}
          versionId={Number(versionId)}
          onClose={() => setModal({ open: false })}
          onSuccess={refetch}
        />
      )}
    </Paper>
  );
}

export default ProductApiEndpointPage;
