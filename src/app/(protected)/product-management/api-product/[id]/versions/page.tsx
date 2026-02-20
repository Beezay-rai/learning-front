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
  ProductVersion,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import ApiProductVersionModal from "./ApiProductVersionModal";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import { LayersIcon } from "lucide-react";

function ApiProductVersionPage() {
  const params = useParams();
  console.log({ ...params })
  const confirm = useConfirm();

  const [modal, setModal] = useState<{
    open: boolean;
    selected?: ProductVersion | null;
  }>({ open: false });

  const { useGetApiProductVersions, useDeleteApiProductVersion } =
    useOrchestratorApiService();

  const { data, isLoading, refetch } = useGetApiProductVersions(Number(params?.id));

  const { mutateAsync: deleteVersion } = useDeleteApiProductVersion();

  const columns: ColumnDef<ProductVersion>[] = [
    { accessorKey: "version", header: "Version" },
    {
      accessorKey: "enable",
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Chip color="success" label="Enabled" />
        ) : (
          <Chip color="error" label="Disabled" />
        ),
    },
    { accessorKey: "description", header: "Description" },
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
              <MenuItem>
                <Link
                  href={
                    routes["(protected)"]["product-management"]["api-product"]
                      .index + row.original.id + "/versions/" + row.original.id + "/product-endpoints"
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
                  <ListItemText>View Endpoints</ListItemText>
                </Link>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  confirm({
                    onConfirm: async () => {
                      await deleteVersion({
                        id: row.original.id,
                        productId: row.original.productId
                      }, {
                        onSuccess: () => {
                          toast.success("Version deleted");
                          refetch();
                        },
                      });
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
        <Typography variant="h6">Product Versions</Typography>

        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setModal({ open: true })}
        >
          Add Version
        </Button>
      </Box>

      <DataTable
        isLoading={isLoading}
        data={data?.data || []}
        columns={columns}
        refetchData={refetch}
      />

      {modal.open && (
        <ApiProductVersionModal
          open={modal.open}
          defaultValue={modal.selected}
          productId={Number(params?.id)}
          onClose={() => setModal({ open: false })}
          onSuccess={refetch}
        />
      )}
    </Paper>
  );
}

export default ApiProductVersionPage;
