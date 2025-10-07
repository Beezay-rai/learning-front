"use client";

import { apiService } from "@/api/api-gateway/apiService";
import { Cluster } from "@/api/api-gateway/interfaces/cluster";
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
} from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getAllClusters();
        setClusters(result.items);
        setTotalCount(result.total);
      } catch (err) {
        setError("Failed to load clusters");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rowsPerPage]);

  const handlePageChange = (_event: any, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Clusters
      </Typography>
      <Link href={"/api-gateway/cluster/add"}>
        <Button variant="contained" color="primary" sx={{ mb: 2 }}>
          Add Cluster Destination
        </Button>
      </Link>

      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Cluster Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Created By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {error}
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
                  <>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRows((prev) => ({
                              ...prev,
                              [cluster.id]: !prev[cluster.id],
                            }))
                          }
                        >
                          {openRows[cluster.id] ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{cluster.name}</TableCell>
                      <TableCell>
                        {cluster.deleted_Status ? "Deleted" : "Active"}
                      </TableCell>
                      <TableCell>
                        {new Date(cluster.created_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{cluster.created_By || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={5}
                      >
                        <Collapse
                          in={openRows[cluster.id]}
                          timeout="auto"
                          unmountOnExit
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
                                    {dest.deleted_Status ? "Deleted" : "Active"}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      dest.created_date
                                    ).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
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
}

export default ClusterPage;
