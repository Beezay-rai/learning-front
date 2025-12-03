"use client";

import { apiService } from "@/services/apiServices/api-gateway/apiService";
import { Cluster } from "@/services/apiServices/api-gateway/interfaces/Cluster";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Collapse,
  IconButton,
  Typography,
  CircularProgress,
  Button,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { routes } from "@/app/routes.generated";
import ReloadIconButton from "@/components/ui/button/RefetchIconButton";

const ClusterPage = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const {
    data: clustersData,
    isLoading,
    error,
    refetch: refetchClusterList,
  } = apiService.useGetClusters(rowsPerPage);
  const clusters = clustersData?.items ?? [];
  const totalCount = clustersData?.total ?? 0;

  const handlePageChange = (_event: unknown, newPage: number) =>
    setPage(newPage);

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRow = (clusterId: string) =>
    setOpenRows((prev) => ({ ...prev, [clusterId]: !prev[clusterId] }));

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">Clusters</Typography>
        <Link href="/api-gateway/cluster/add">
          <Button variant="contained" color="primary">
            Add Cluster
          </Button>
        </Link>
      </Box>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Box
          sx={{
            float: "right",
          }}
        >
          <ReloadIconButton
            size="small"
            color="info"
            onClick={() => refetchClusterList()}
          ></ReloadIconButton>
        </Box>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Cluster Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {error.message}
                </TableCell>
              </TableRow>
            ) : clusters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No clusters found.
                </TableCell>
              </TableRow>
            ) : (
              clusters
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cluster) => (
                  <React.Fragment key={cluster.id}>
                    <TableRow
                      hover
                      onClick={() =>
                        setOpenRows((prev) => ({
                          ...prev,
                          [cluster.id]: !prev[cluster.id],
                        }))
                      }
                    >
                      <TableCell>
                        <IconButton size="small">
                          {openRows[cluster.id] ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{cluster.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={cluster.deleted_Status ? "Deleted" : "Active"}
                          color={cluster.deleted_Status ? "error" : "success"}
                        ></Chip>
                      </TableCell>
                      <TableCell>
                        {new Date(cluster.created_date).toLocaleDateString(
                          "en-CA"
                        )}
                      </TableCell>
                      <TableCell>{cluster.created_By || "N/A"}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={1}>
                          <Link
                            href={
                              routes["(protected)"]["api-gateway"].cluster.edit
                                .index + cluster.id
                            }
                          >
                            <IconButton color="primary" size="small">
                              <EditIcon />
                            </IconButton>
                          </Link>

                          {/* <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              // handle delete logic here (e.g., open confirm dialog)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton> */}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={5}
                      >
                        <Collapse
                          in={openRows[cluster.id]}
                          timeout="auto"
                          // unmountOnExit
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Destination Name</TableCell>
                                <TableCell>Cluster ID</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {cluster.clusterDestination.map((dest) => (
                                <TableRow key={dest.id}>
                                  <TableCell>{dest.name}</TableCell>
                                  <TableCell>{dest.clusterId}</TableCell>
                                  <TableCell>
                                    {dest.destinationAddress}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        dest.deleted_Status
                                          ? "Deleted"
                                          : "Active"
                                      }
                                      color={
                                        dest.deleted_Status
                                          ? "error"
                                          : "success"
                                      }
                                    ></Chip>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      dest.created_date
                                    ).toLocaleDateString("en-CA")}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};

export default ClusterPage;
