"use client";

import { useMemo, useState } from "react";
import { Box, Button, Chip, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";
import { ApiScopeModel, IdentityClientModel } from "@/services/apiServices/idsrv/interface/IdentityConfigModel";
import { PaginationRequest } from "@/services/apiServices/common/PaginationModel";

function getTableData<T>(data: T[] | { items?: T[] } | undefined): T[] {
  return Array.isArray(data) ? data : data?.items ?? [];
}

function getTotalCount<T>(data: T[] | { items?: T[]; totalCount?: number } | undefined) {
  return Array.isArray(data) ? data.length : data?.totalCount ?? data?.items?.length ?? 0;
}

function IdentityClientSection() {
  const router = useRouter();
  const confirm = useConfirm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { useGetClients, useDeleteClient } = useIdsrvService();
  const pagination = useMemo(() => {
    const request = new PaginationRequest();
    request.page = page + 1;
    request.pageSize = rowsPerPage;
    return request;
  }, [page, rowsPerPage]);
  const { data, isLoading, isFetching, refetch } = useGetClients(pagination, { enabled: true });
  const deleteMutation = useDeleteClient();

  const columns: ColumnDef<IdentityClientModel>[] = [
    { header: "Client ID", accessorKey: "clientId" },
    { header: "Client Name", accessorKey: "clientName" },
    { header: "Grant Types", accessorKey: "grantTypes" },
    { header: "Redirect URIs", cell: ({ row }) => row.original.redirectUris.join(", ") || "N/A" },
    { header: "Require PKCE", cell: ({ row }) => <Chip size="small" label={row.original.requirePkce ? "Yes" : "No"} color={row.original.requirePkce ? "success" : "default"} variant="outlined" /> },
    { header: "Allowed Scopes", cell: ({ row }) => row.original.allowedScopes.join(", ") || "N/A" },
    {
      header: "Action",
      cell: ({ row }) => row.original.clientId !== "nextjs-app" && (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => router.push(`/configure/idsrv/clients/edit/${row.original.id}`)}>Edit</Button>
          <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => confirm({ onConfirm: async () => deleteMutation.mutateAsync(row.original.id, { onSuccess: () => { toast.success("Identity client deleted successfully."); refetch(); }, onError: () => toast.error("Failed to delete identity client.") }) })}>Delete</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box><Typography variant="h6">Identity Clients</Typography><Typography variant="body2" color="text.secondary">Manage OpenID Connect clients used by the identity server.</Typography></Box>
        <Button variant="contained" onClick={() => router.push("/configure/idsrv/clients/add")}>Add Client</Button>
      </Stack>
      <DataTable isLoading={isLoading || isFetching} columns={columns} data={getTableData(data?.data)} refetchData={refetch} paginationConfig={{ page, rowsPerPage, totalCount: getTotalCount(data?.data), handlePageChange: (_, value) => setPage(value), handleRowsPerPageChange: (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); } }} />
    </Paper>
  );
}

function ApiScopeSection() {
  const router = useRouter();
  const confirm = useConfirm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { useGetApiScopes, useDeleteApiScope } = useIdsrvService();
  const pagination = useMemo(() => {
    const request = new PaginationRequest();
    request.page = page + 1;
    request.pageSize = rowsPerPage;
    return request;
  }, [page, rowsPerPage]);
  const { data, isLoading, isFetching, refetch } = useGetApiScopes(pagination, { enabled: true });
  const deleteMutation = useDeleteApiScope();
  const columns: ColumnDef<ApiScopeModel>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Display Name", accessorKey: "displayName" },
    { header: "User Claims", cell: ({ row }) => row.original.userClaims?.join(", ") || "N/A" },
    { header: "Status", cell: ({ row }) => <Chip size="small" label={row.original.enabled ? "Enabled" : "Disabled"} color={row.original.enabled ? "success" : "default"} variant="outlined" /> },
    { header: "Description", accessorKey: "description", cell: ({ getValue }) => getValue<string>() || "N/A" },
    {
      header: "Action",
      cell: ({ row }) => row.original.id > 2 && <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => router.push(`/configure/idsrv/scopes/edit/${row.original.id}`)}>Edit</Button>
        <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => confirm({ onConfirm: async () => deleteMutation.mutateAsync(row.original.id, { onSuccess: () => { toast.success("API scope deleted successfully."); refetch(); }, onError: () => toast.error("Failed to delete API scope.") }) })}>Delete</Button>
      </Stack>,
    },
  ];
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box><Typography variant="h6">API Scopes</Typography><Typography variant="body2" color="text.secondary">Manage the scopes exposed by the identity server.</Typography></Box>
        <Button variant="contained" onClick={() => router.push("/configure/idsrv/scopes/add")}>Add Scope</Button>
      </Stack>
      <DataTable isLoading={isLoading || isFetching} columns={columns} data={getTableData(data?.data)} refetchData={refetch} paginationConfig={{ page, rowsPerPage, totalCount: getTotalCount(data?.data), handlePageChange: (_, value) => setPage(value), handleRowsPerPageChange: (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); } }} />
    </Paper>
  );
}

export default function ConfigurePage() {
  const [tab, setTab] = useState(0);
  return <Box sx={{ display: "grid", gap: 3 }}>
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>Identity Server</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage identity server clients and scopes from one place.</Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab label="Identity Clients" /><Tab label="API Scopes" /></Tabs>
    </Paper>
    {tab === 0 ? <IdentityClientSection /> : <ApiScopeSection />}
  </Box>;
}
