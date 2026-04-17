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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useEffect, useMemo, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  Route,
  RouteConfigureRequest,
} from "@/services/apiServices/api-gateway/interfaces/route";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import ApiConfigureModal, {
  ApiConfigureFormData,
} from "../../components/ApiConfigureModal";
import SettingsIcon from "@mui/icons-material/Settings";
import useApiGatewayService from "@/services/apiServices/api-gateway/useApiGatewayService";
import { toast } from "react-toastify";
import { mapMatchingKeys } from "@/utils/autoMap";

function RoutePage() {
  const confirm = useConfirm();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [configureModal, setConfigureModal] = useState<{
    open: boolean;
    routeId?: number | null;
    // selectedRow?: RouteConfigureRequest | null;
  }>({
    open: false,
    // selectedRow: null,
    routeId: 0,
  });

  const {
    useGetRoutes,
    useDeleteRoute,
    useGetRouteConfigureById,
    useConfigureRouteById,
  } = useApiGatewayService();

  const {
    data: routeList,
    isLoading,
    error,
    isRefetching,
    refetch: refetchRouteList,
  } = useGetRoutes();

  const { mutateAsync: deleteRouteMutateAsync } = useDeleteRoute();
  const {
    mutateAsync: configureRouteMutateAsync,
    isPending: configureLoading,
  } = useConfigureRouteById();

  const handlePageChange = (e: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const { data: configureData, refetch: refetchConfigureData } =
    useGetRouteConfigureById(configureModal.routeId!, {
      enabled: !!configureModal.routeId,
    });

  const handleSetConfigureModal = (id: number) => {
    setConfigureModal({
      open: true,
      routeId: id,
      // selectedRow: null,
    });
  };

  const handleConfigure = async (data: ApiConfigureFormData) => {
    await configureRouteMutateAsync(
      {
        id: configureModal.routeId!,
        payload: data as RouteConfigureRequest,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message);
          setConfigureModal({
            open: false,
            routeId: null,
            // selectedRow: null,
          });
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    confirm({
      onConfirm: async () => {
        await deleteRouteMutateAsync(id, {
          onSuccess: () => {
            toast.error("API Deleted Sucessfully !");
            refetchRouteList();
          },
          onError: () => {
            toast.error("Error Occured  !");
          },
        });
      },
    });
  };

  function RouteActionCell({ row }: { row: Row<Route> }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const id = row.original.id;

    return (
      <>
        <IconButton size="small" onClick={handleOpen}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleClose}>
            <Link
              href={routes["(protected)"]["api-gateway"].route.edit.index + id}
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

          <MenuItem
            onClick={() => {
              handleClose();
              handleSetConfigureModal(row.original.id);
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Configure</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClose();
              handleDelete(id);
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
  }
  // useEffect(() => {
  //   // if (!configureData?.data) return;

  //   setConfigureModal({
  //     open: true,
  //     routeId: configureModal.routeId,
  //     selectedRow: configureData?.data,
  //   });
  // }, [configureData, configureModal.routeId]);

  const routeColumns: ColumnDef<Route>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "id",
      header: "Route ID",
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
      accessorKey: "clusterId",
      header: "Cluster ID",
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
          : new Date(value).toLocaleDateString("en-CA");
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
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-CA"),
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
          : new Date(value).toLocaleDateString("en-CA");
      },
    },
    {
      header: "Action",
      cell: ({ row }) => <RouteActionCell row={row} />,
    },
  ];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <ApiConfigureModal
        open={configureModal.open}
        isLoading={configureLoading}
        // defaultValue={configureModal?.selectedRow as ApiConfigureFormData}
        defaultValue={configureData as ApiConfigureFormData}
        onClose={() => setConfigureModal({ open: false })}
        onUpdate={handleConfigure}
      />

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
        isLoading={isLoading || isRefetching}
        columns={routeColumns}
        data={routeList?.data.items || []}
        refetchData={refetchRouteList}
      />

      <TablePagination
        component="div"
        count={routeList?.data.totalCount ?? 0}
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
