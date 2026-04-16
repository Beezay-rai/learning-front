"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Minus, Plus } from "lucide-react";
import DataTable from "@/components/ui/table/DataTable";
import useConfirm from "@/hooks/useConfirm";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";
import {
  AddApiScopeRequest,
  AddIdentityClientRequest,
  ApiScopeModel,
  IdentityClientModel,
  UpdateApiScopeRequest,
  UpdateIdentityClientRequest,
} from "@/services/apiServices/idsrv/interface/IdentityConfigModel";
import { PaginationRequest } from "@/services/apiServices/common/PaginationModel";

type ClientFormValues = {
  clientId: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string;
  requireConsent: boolean;
  requirePkce: boolean;
  redirectUris: { value: string }[];
  postLogoutRedirectUris: { value: string }[];
  allowedScopes: { value: string }[];
  allowedCorsOrigins: { value: string }[];
};

type ScopeFormValues = {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  userClaims: { value: string }[];
};

const emptyClientFormValues: ClientFormValues = {
  clientId: "",
  clientName: "",
  clientSecret: "",
  grantTypes: "authorization_code",
  requireConsent: false,
  requirePkce: true,
  redirectUris: [{ value: "" }],
  postLogoutRedirectUris: [{ value: "" }],
  allowedScopes: [
    { value: "openid" },
    { value: "profile" },
    { value: "email" },
  ],
  allowedCorsOrigins: [{ value: "" }],
};

const emptyScopeFormValues: ScopeFormValues = {
  name: "",
  displayName: "",
  description: "",
  enabled: true,
  userClaims: [{ value: "" }],
};

function toArrayField(values?: string[]) {
  if (!values || values.length === 0) {
    return [{ value: "" }];
  }

  return values.map((value) => ({ value }));
}

function toStringArray(values: { value: string }[]) {
  return values.map((item) => item.value.trim()).filter(Boolean);
}



function getTableData<T>(data: T[] | { items?: T[] } | undefined) {
  if (!data) return [] as T[];
  return Array.isArray(data) ? data : (data.items ?? []);
}

function getTotalCount<T>(
  data: T[] | { items?: T[]; totalCount?: number } | undefined,
) {
  if (!data) return 0;
  return Array.isArray(data)
    ? data.length
    : (data.totalCount ?? data.items?.length ?? 0);
}

function IdentityClientSection() {
  const confirm = useConfirm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<IdentityClientModel | null>(null);

  const { useGetClients, useAddClient, useUpdateClient, useDeleteClient } =
    useIdsrvService();

  const clientPagination = useMemo(() => {
    const pagination = new PaginationRequest();
    pagination.page = page + 1;
    pagination.pageSize = rowsPerPage;
    return pagination;
  }, [page, rowsPerPage]);

  const {
    data: clientList,
    isLoading,
    isFetching,
    refetch: refetchClients,
  } = useGetClients(clientPagination, { enabled: true });

  const addClientMutation = useAddClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  const clientForm = useForm<ClientFormValues>({
    defaultValues: emptyClientFormValues,
  });

  const { control, handleSubmit, formState, reset, register } = clientForm;

  const redirectUrisFieldArray = useFieldArray({
    control,
    name: "redirectUris",
  });

  const postLogoutUrisFieldArray = useFieldArray({
    control,
    name: "postLogoutRedirectUris",
  });

  const allowedScopesFieldArray = useFieldArray({
    control,
    name: "allowedScopes",
  });

  const allowedCorsOriginsFieldArray = useFieldArray({
    control,
    name: "allowedCorsOrigins",
  });

  const clientColumns: ColumnDef<IdentityClientModel>[] = [
    { header: "Client ID", accessorKey: "clientId" },
    { header: "Client Name", accessorKey: "clientName" },
    { header: "Grant Types", accessorKey: "grantTypes" },
    {
      header: "Redirect URIs",
      cell: ({ row }) => row.original.redirectUris.join(", ") || "N/A",
    },
    {
      header: "Require PKCE",
      cell: ({ row }) => (
        <Chip
          size="small"
          label={row.original.requirePkce ? "Yes" : "No"}
          color={row.original.requirePkce ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      header: "Allowed Scopes",
      cell: ({ row }) => row.original.allowedScopes.join(", ") || "N/A",
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <>
          {row.original.clientId !== "nextjs-app" && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingClient(row.original);
                  reset({
                    clientId: row.original.clientId,
                    clientName: row.original.clientName,
                    clientSecret: "",
                    grantTypes: row.original.grantTypes,
                    requireConsent: row.original.requireConsent,
                    requirePkce: row.original.requirePkce,
                    redirectUris: toArrayField(row.original.redirectUris),
                    postLogoutRedirectUris: toArrayField(
                      row.original.postLogoutRedirectUris,
                    ),
                    allowedScopes: toArrayField(row.original.allowedScopes),
                    allowedCorsOrigins: toArrayField(
                      row.original.allowedCorsOrigins,
                    ),
                  });
                  setEditorOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  confirm({
                    onConfirm: async () => {
                      await deleteClientMutation.mutateAsync(row.original.id, {
                        onSuccess: () => {
                          toast.success(
                            "Identity client deleted successfully.",
                          );
                          refetchClients();
                        },
                        onError: () => {
                          toast.error("Failed to delete identity client.");
                        },
                      });
                    },
                  });
                }}
              >
                Delete
              </Button>
            </Stack>
          )}
        </>
      ),
    },
  ];

  const openNewClientDialog = () => {
    setEditingClient(null);
    reset(emptyClientFormValues);
    setEditorOpen(true);
  };

  const onSubmitClient = async (values: ClientFormValues) => {
    const createPayload: AddIdentityClientRequest = {
      clientId: values.clientId,
      clientName: values.clientName,
      clientSecret: values.clientSecret,
      grantTypes: values.grantTypes,
      requireConsent: values.requireConsent,
      requirePkce: values.requirePkce,
      redirectUris: toStringArray(values.redirectUris),
      postLogoutRedirectUris: toStringArray(values.postLogoutRedirectUris),
      allowedScopes: toStringArray(values.allowedScopes),
      allowedCorsOrigins: toStringArray(values.allowedCorsOrigins),
    };

    if (editingClient) {
      const updatePayload: UpdateIdentityClientRequest = {
        ...createPayload,
        clientSecret: values.clientSecret || undefined,
      };

      await updateClientMutation.mutateAsync(
        { id: editingClient.id, payload: updatePayload },
        {
          onSuccess: () => {
            toast.success("Identity client updated successfully.");
            setEditorOpen(false);
            setEditingClient(null);
            refetchClients();
          },
          onError: () => toast.error("Failed to update identity client."),
        },
      );
      return;
    }

    await addClientMutation.mutateAsync(createPayload, {
      onSuccess: () => {
        toast.success("Identity client added successfully.");
        setEditorOpen(false);
        refetchClients();
      },
      onError: () => toast.error("Failed to add identity client."),
    });
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">Identity Clients</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage OpenID Connect clients used by the identity server.
          </Typography>
        </Box>
        <Button variant="contained" onClick={openNewClientDialog}>
          Add Client
        </Button>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={clientColumns}
        data={getTableData(clientList?.data)}
        refetchData={refetchClients}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: getTotalCount(clientList?.data),
          handlePageChange: (_, newPage) => setPage(newPage),
          handleRowsPerPageChange: (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          },
        }}
      />

      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingClient ? "Update Identity Client" : "Add Identity Client"}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            id="identity-client-form"
            onSubmit={handleSubmit(onSubmitClient)}
            sx={{ display: "grid", gap: 2, pt: 1 }}
          >
            <TextField
              label="Client ID"
              {...register("clientId")}
              error={!!formState.errors.clientId}
              helperText={formState.errors.clientId?.message}
              fullWidth
            />
            <TextField
              label="Client Name"
              {...register("clientName")}
              error={!!formState.errors.clientName}
              helperText={formState.errors.clientName?.message}
              fullWidth
            />
            <TextField
              label="Client Secret"
              type="password"
              {...register("clientSecret")}
              error={!!formState.errors.clientSecret}
              helperText={formState.errors.clientSecret?.message}
              fullWidth
            />
            <TextField
              label="Grant Type"
              select
              {...register("grantTypes")}
              error={!!formState.errors.grantTypes}
              helperText={formState.errors.grantTypes?.message}
              fullWidth
            >
              <MenuItem value="authorization_code">authorization_code</MenuItem>
              <MenuItem value="client_credentials">client_credentials</MenuItem>
            </TextField>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">Redirect URIs</Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => redirectUrisFieldArray.append({ value: "" })}
              >
                Add Entry
              </Button>
            </Box>
            {redirectUrisFieldArray.fields.map((field, index) => (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Controller
                  name={`redirectUris.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Redirect URI" fullWidth />
                  )}
                />
                <Tooltip
                  title="At least one entry is required"
                  disableHoverListener={
                    redirectUrisFieldArray.fields.length !== 1
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      disabled={redirectUrisFieldArray.fields.length === 1}
                      onClick={() => redirectUrisFieldArray.remove(index)}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">
                Post Logout Redirect URIs
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => postLogoutUrisFieldArray.append({ value: "" })}
              >
                Add Entry
              </Button>
            </Box>
            {postLogoutUrisFieldArray.fields.map((field, index) => (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Controller
                  name={`postLogoutRedirectUris.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Post Logout Redirect URI"
                      fullWidth
                    />
                  )}
                />
                <Tooltip
                  title="At least one entry is required"
                  disableHoverListener={
                    postLogoutUrisFieldArray.fields.length !== 1
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      disabled={postLogoutUrisFieldArray.fields.length === 1}
                      onClick={() => postLogoutUrisFieldArray.remove(index)}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">Allowed Scopes</Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => allowedScopesFieldArray.append({ value: "" })}
              >
                Add Entry
              </Button>
            </Box>
            {allowedScopesFieldArray.fields.map((field, index) => (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Controller
                  name={`allowedScopes.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Allowed Scope" fullWidth />
                  )}
                />
                <Tooltip
                  title="At least one entry is required"
                  disableHoverListener={
                    allowedScopesFieldArray.fields.length !== 1
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      disabled={allowedScopesFieldArray.fields.length === 1}
                      onClick={() => allowedScopesFieldArray.remove(index)}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">Allowed CORS Origins</Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() =>
                  allowedCorsOriginsFieldArray.append({ value: "" })
                }
              >
                Add Entry
              </Button>
            </Box>
            {allowedCorsOriginsFieldArray.fields.map((field, index) => (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Controller
                  name={`allowedCorsOrigins.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Allowed CORS Origin"
                      fullWidth
                    />
                  )}
                />
                <Tooltip
                  title="At least one entry is required"
                  disableHoverListener={
                    allowedCorsOriginsFieldArray.fields.length !== 1
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      disabled={
                        allowedCorsOriginsFieldArray.fields.length === 1
                      }
                      onClick={() => allowedCorsOriginsFieldArray.remove(index)}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <FormControlLabel
              control={
                <Controller
                  control={control}
                  name="requireConsent"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  )}
                />
              }
              label="Require Consent"
            />
            <FormControlLabel
              control={
                <Controller
                  control={control}
                  name="requirePkce"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  )}
                />
              }
              label="Require PKCE"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditorOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            form="identity-client-form"
            variant="contained"
            disabled={
              addClientMutation.isPending || updateClientMutation.isPending
            }
          >
            {editingClient ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function ApiScopeSection() {
  const confirm = useConfirm();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<ApiScopeModel | null>(null);

  const {
    useGetApiScopes,
    useAddApiScope,
    useUpdateApiScope,
    useDeleteApiScope,
  } = useIdsrvService();

  const apiScopePagination = useMemo(() => {
    const pagination = new PaginationRequest();
    pagination.page = page + 1;
    pagination.pageSize = rowsPerPage;
    return pagination;
  }, [page, rowsPerPage]);

  const {
    data: scopeList,
    isLoading,
    isFetching,
    refetch: refetchScopes,
  } = useGetApiScopes(apiScopePagination, { enabled: true });

  const addScopeMutation = useAddApiScope();
  const updateScopeMutation = useUpdateApiScope();
  const deleteScopeMutation = useDeleteApiScope();

  const scopeForm = useForm<ScopeFormValues>({
    defaultValues: emptyScopeFormValues,
  });

  const { control, handleSubmit, formState, register, reset } = scopeForm;

  const userClaimsFieldArray = useFieldArray({
    control,
    name: "userClaims",
  });

  const scopeColumns: ColumnDef<ApiScopeModel>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Display Name", accessorKey: "displayName" },
    {
      header: "User Claims",
      cell: ({ row }) => row.original.userClaims?.join(", ") || "N/A",
    },
    {
      header: "Status",
      cell: ({ row }) => (
        <Chip
          size="small"
          label={row.original.enabled ? "Enabled" : "Disabled"}
          color={row.original.enabled ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ getValue }) => getValue<string>() || "N/A",
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <>
          {row.original.id > 2 && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  setEditingScope(row.original);
                  reset({
                    name: row.original.name,
                    displayName: row.original.displayName,
                    description: row.original.description || "",
                    enabled: row.original.enabled,
                    userClaims: toArrayField(row.original.userClaims),
                  });
                  setEditorOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  confirm({
                    onConfirm: async () => {
                      await deleteScopeMutation.mutateAsync(row.original.id, {
                        onSuccess: () => {
                          toast.success("API scope deleted successfully.");
                          refetchScopes();
                        },
                        onError: () => {
                          toast.error("Failed to delete API scope.");
                        },
                      });
                    },
                  });
                }}
              >
                Delete
              </Button>
            </Stack>
          )}
        </>
      ),
    },
  ];

  const openNewScopeDialog = () => {
    setEditingScope(null);
    reset(emptyScopeFormValues);
    setEditorOpen(true);
  };

  const onSubmitScope = async (values: ScopeFormValues) => {
    const payload: AddApiScopeRequest | UpdateApiScopeRequest = {
      name: values.name,
      displayName: values.displayName,
      description: values.description,
      enabled: values.enabled,
      userClaims: toStringArray(values.userClaims),
    };

    if (editingScope) {
      await updateScopeMutation.mutateAsync(
        { id: editingScope.id, payload },
        {
          onSuccess: () => {
            toast.success("API scope updated successfully.");
            setEditorOpen(false);
            setEditingScope(null);
            refetchScopes();
          },
          onError: () => toast.error("Failed to update API scope."),
        },
      );
      return;
    }

    await addScopeMutation.mutateAsync(payload, {
      onSuccess: () => {
        toast.success("API scope added successfully.");
        setEditorOpen(false);
        refetchScopes();
      },
      onError: () => toast.error("Failed to add API scope."),
    });
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h6">API Scopes</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the scopes exposed by the identity server.
          </Typography>
        </Box>
        <Button variant="contained" onClick={openNewScopeDialog}>
          Add Scope
        </Button>
      </Box>

      <DataTable
        isLoading={isLoading || isFetching}
        columns={scopeColumns}
        data={getTableData(scopeList?.data)}
        refetchData={refetchScopes}
        paginationConfig={{
          page,
          rowsPerPage,
          totalCount: getTotalCount(scopeList?.data),
          handlePageChange: (_, newPage) => setPage(newPage),
          handleRowsPerPageChange: (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          },
        }}
      />

      <Dialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingScope ? "Update API Scope" : "Add API Scope"}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            id="api-scope-form"
            onSubmit={handleSubmit(onSubmitScope)}
            sx={{ display: "grid", gap: 2, pt: 1 }}
          >
            <TextField
              fullWidth
              label="Name"
              {...register("name")}
              error={!!formState.errors.name}
              helperText={formState.errors.name?.message}
            />
            <TextField
              fullWidth
              label="Display Name"
              {...register("displayName")}
              error={!!formState.errors.displayName}
              helperText={formState.errors.displayName?.message}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              minRows={2}
              {...register("description")}
              error={!!formState.errors.description}
              helperText={formState.errors.description?.message}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">User Claims</Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => userClaimsFieldArray.append({ value: "" })}
              >
                Add Entry
              </Button>
            </Box>
            {userClaimsFieldArray.fields.map((field, index) => (
              <Stack
                key={field.id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Controller
                  name={`userClaims.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="User Claim" fullWidth />
                  )}
                />
                <Tooltip
                  title="At least one claim is required"
                  disableHoverListener={
                    userClaimsFieldArray.fields.length !== 1
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      disabled={userClaimsFieldArray.fields.length === 1}
                      onClick={() => userClaimsFieldArray.remove(index)}
                    >
                      <Minus size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}

            <FormControlLabel
              control={
                <Controller
                  control={control}
                  name="enabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  )}
                />
              }
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditorOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            form="api-scope-form"
            variant="contained"
            disabled={
              addScopeMutation.isPending || updateScopeMutation.isPending
            }
          >
            {editingScope ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default function ConfigurePage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Configure
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage identity server clients and scopes from one place.
        </Typography>
        <Tabs value={tab} onChange={(_, value) => setTab(value)}>
          <Tab label="Identity Clients" />
          <Tab label="API Scopes" />
        </Tabs>
      </Paper>

      {tab === 0 ? <IdentityClientSection /> : <ApiScopeSection />}
    </Box>
  );
}
