"use client";

import { use, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import DataTable from "@/components/ui/table/DataTable";
import useOrchestratorApiService from "@/services/apiServices/orchestrator/useOrchestratorApiService";
import { ApiUserKeyModel, ApiUserKeyRequest } from "@/services/apiServices/core/interface/ApiUserModel";
import { routes } from "@/app/routes.generated";
import GenerateKeyModal from "./GenerateKeyModal";

export default function ApiUserKeysList({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const apiUserId = parseInt(unwrappedParams.id, 10);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { useGetApiUserKeys, useGenerateApiUserKey } = useOrchestratorApiService();

  const {
    data: keysData,
    isLoading,
    isFetching,
    refetch: refetchKeys,
  } = useGetApiUserKeys(apiUserId, {
    page: page + 1,
    pageSize: rowsPerPage,
  });

  const { mutateAsync: generateKey, isPending: isGenerating } = useGenerateApiUserKey();

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGenerateKeySubmit = async (data: ApiUserKeyRequest) => {
    try {
      await generateKey({ api_user_id: apiUserId, payload: data });
      toast.success("API Key generated successfully!");
      setIsModalOpen(false);
      refetchKeys();
    } catch (error) {
      toast.error("Failed to generate API Key.");
    }
  };

  const columns: ColumnDef<ApiUserKeyModel>[] = [
    {
      header: "Key Name",
      accessorKey: "keyName",
    },
    {
      header: "Api Key",
      accessorKey: "apiKey",
    },
    {
      header: "Permissions",
      accessorKey: "permissions",
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Link href={routes["(protected)"]["user-management"]["api-user"].index}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />}>
            Back to API Users
          </Button>
        </Link>
        <Typography variant="h5" component="h1">
          App Keys
        </Typography>
      </Stack>

      <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            API User Keys Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VpnKeyIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Generate New Key
          </Button>
        </Box>

        <DataTable
          isLoading={isLoading || isFetching}
          columns={columns}
          data={keysData?.data?.items || []}
          refetchData={refetchKeys}
          paginationConfig={{
            page,
            rowsPerPage,
            totalCount: keysData?.data?.totalCount || 0,
            handlePageChange,
            handleRowsPerPageChange,
          }}
        />
      </Paper>

      <GenerateKeyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateKeySubmit}
        loading={isGenerating}
      />
    </Box>
  );
}
