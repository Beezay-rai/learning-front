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
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ColumnDef, Row } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import { routes } from "@/app/routes.generated";
import useWorkflowService, {
  Workflow,
  WorkflowStatus,
} from "@/services/apiServices/workflow/useWorkflowService";

/* ── Status chip ──────────────────────────────────────────────────────────── */
const STATUS_COLOR: Record<WorkflowStatus, "success" | "default" | "warning"> =
  {
    active: "success",
    inactive: "default",
    draft: "warning",
  };

function StatusChip({ status }: { status: WorkflowStatus }) {
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={STATUS_COLOR[status]}
      size="small"
      variant="outlined"
    />
  );
}

/* ── Row action menu ──────────────────────────────────────────────────────── */
function WorkflowActionCell({
  row,
  onDelete,
}: {
  row: Row<Workflow>;
  onDelete: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {/* Open Builder */}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            router.push(
              `${routes["(protected)"].workflow.builder.index}${row.original.id}/builder`,
            );
          }}
        >
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Open Builder</ListItemText>
        </MenuItem>

        {/* Edit */}
        <MenuItem
          component={Link}
          href={`${routes["(protected)"].workflow.edit.index}${row.original.id}`}
          onClick={() => setAnchorEl(null)}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        {/* Delete */}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onDelete(row.original.id);
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

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function WorkflowListPage() {
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { useGetWorkflows, useDeleteWorkflow } = useWorkflowService();

  const {
    data: workflowData,
    isLoading,
    isRefetching,
    refetch,
  } = useGetWorkflows({ page, pageSize: rowsPerPage, search });

  const { mutateAsync: deleteWorkflow } = useDeleteWorkflow();

  const handleDelete = useCallback(
    (id: string) => {
      confirm({
        onConfirm: async () => {
          await deleteWorkflow(id, {
            onSuccess: () => {
              toast.success("Workflow deleted");
              refetch();
            },
          });
        },
      });
    },
    [confirm, deleteWorkflow, refetch],
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const columns: ColumnDef<Workflow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {info.getValue() as string}
          </Typography>
          {(info.row.original.comment ?? "").length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {info.row.original.comment}
            </Typography>
          )}
        </Box>
      ),
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => <StatusChip status={info.getValue() as WorkflowStatus} />,
    },
    {
      accessorKey: "stateCount",
      header: "States",
      cell: (info) => (
        <Chip
          label={info.getValue() as number}
          size="small"
          sx={{ fontWeight: 700, minWidth: 36 }}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleDateString("en-CA"),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: (info) =>
        new Date(info.getValue() as string).toLocaleString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <WorkflowActionCell row={row} onDelete={handleDelete} />
      ),
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">State Machines</Typography>
          <Typography variant="caption" color="text.secondary">
            Visual workflow orchestration — powered by FlowX
          </Typography>
        </Box>

        <Link href={routes["(protected)"].workflow.add.index}>
          <Button variant="contained" startIcon={<AccountTreeIcon />}>
            Create Workflow
          </Button>
        </Link>
      </Box>

      {/* Search bar */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, maxWidth: 420 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search workflows…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Table */}
      <DataTable
        isLoading={isLoading || isRefetching}
        data={workflowData?.items ?? []}
        columns={columns}
        refetchData={refetch}
      />

      <TablePagination
        component="div"
        count={workflowData?.total ?? 0}
        page={page - 1}
        onPageChange={(_, p) => setPage(p + 1)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(1);
        }}
      />
    </Paper>
  );
}
