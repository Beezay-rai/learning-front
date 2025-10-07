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
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiService } from "@/api/api-gateway/apiService";

function RoutePage() {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getAllRoutes();

        setRoutes(result.items);
        setTotalCount(result.total);
      } catch (err) {
        setRoutes([]);
        setTotalCount(0);
        setError("Failed to load routes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rowsPerPage]);

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Routes
      </Typography>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cluster ID</TableCell>
              <TableCell>Methods</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deleted Date</TableCell>
              <TableCell>Deleted By</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Updated By</TableCell>
              <TableCell>Updated Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {error}
                </TableCell>
              </TableRow>
            ) : routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No routes found.
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id} hover>
                  <TableCell>{route.id}</TableCell>
                  <TableCell>{route.clusterId}</TableCell>
                  <TableCell>{route.methods.join(", ")}</TableCell>
                  <TableCell>{route.path}</TableCell>
                  <TableCell>
                    {route.deleted_Status ? "Deleted" : "Active"}
                  </TableCell>
                  <TableCell>
                    {route.deleted_date === "0001-01-01T00:00:00"
                      ? "N/A"
                      : new Date(route.deleted_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{route.deleted_By || "N/A"}</TableCell>
                  <TableCell>{route.created_By || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(route.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{route.updated_By || "N/A"}</TableCell>
                  <TableCell>
                    {route.updated_Date === "0001-01-01T00:00:00"
                      ? "N/A"
                      : new Date(route.updated_Date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
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
