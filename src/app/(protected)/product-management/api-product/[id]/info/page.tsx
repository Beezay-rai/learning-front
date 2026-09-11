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
import KeyOffIcon from "@mui/icons-material/KeyOff";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import Link from "next/link";

import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import { routes } from "@/app/routes.generated";
import { toast } from "react-toastify";
import useOrchestratorApiService, {
  ProductInfo,
} from "@/services/apiServices/orchestrator/useOrchestratorApiService";

function ProductInfoPage() {
  const params = useParams();
  const productId = Number(params?.id);
  const confirm = useConfirm();

  const {
    useGetProductInfoList,
    useDeleteProductInfo,
    useRevokeProductInfoKey,
  } = useOrchestratorApiService();

  const { data, isLoading, refetch } = useGetProductInfoList(productId);
  const { mutateAsync: deleteInfo } = useDeleteProductInfo();
  const { mutateAsync: revokeKey } = useRevokeProductInfoKey();

  const baseInfoPath =
    routes["(protected)"]["product-management"]["api-product"].index +
    productId +
    "/info";

  function InfoActionCell({ row }: { row: Row<ProductInfo> }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleRevoke = () => {
      setAnchorEl(null);
      confirm({
        onConfirm: async () => {
          await revokeKey(
            { productId, infoId: row.original.id },
            {
              onSuccess: () => {
                toast.success("Key revoked successfully");
                refetch();
              },
            },
          );
        },
      });
    };

    const handleDelete = () => {
      setAnchorEl(null);
      confirm({
        onConfirm: async () => {
          await deleteInfo(
            { productId, infoId: row.original.id },
            {
              onSuccess: () => {
                toast.success("Product info deleted successfully");
                refetch();
              },
            },
          );
        },
      });
    };

    return (
      <>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Link
              href={`${baseInfoPath}/edit/${row.original.id}`}
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </Link>
          </MenuItem>

          <MenuItem onClick={handleRevoke}>
            <ListItemIcon>
              <KeyOffIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText sx={{ color: "warning.main" }}>
              Revoke Key
            </ListItemText>
          </MenuItem>

          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }

  const columns: ColumnDef<ProductInfo>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "productKey", header: "Product Key" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <Chip color="success" label="Active" size="small" />
        ) : (
          <Chip color="error" label="Inactive" size="small" />
        ),
    },
    {
      accessorKey: "revokedAt",
      header: "Revoked At",
      cell: (info) =>
        info.getValue()
          ? new Date(info.getValue() as string).toLocaleString("en-CA", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "—",
    },
    { accessorKey: "revokedReason", header: "Revoke Reason" },
    {
      header: "Action",
      cell: ({ row }) => <InfoActionCell row={row} />,
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Product Info</Typography>
        <Link href={`${baseInfoPath}/add`}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Info
          </Button>
        </Link>
      </Box>

      <DataTable<ProductInfo>
        isLoading={isLoading}
        data={data?.data.items ?? []}
        columns={columns}
        refetchData={refetch}
      />
    </Paper>
  );
}

export default ProductInfoPage;
