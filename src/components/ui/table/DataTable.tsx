import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import {
  flexRender,
  getCoreRowModel,
  RowData,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import TableBodySkeleton from "../../molecules/TableBodySkeleton";
import ReloadIconButton from "../button/RefetchIconButton";

interface PaginationConfig {
  page: number;
  totalCount: number;
  rowsPerPage: number;
  handlePageChange: (event: unknown, newPage: number) => void;
  handleRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DataTableProp<TData extends RowData>
  extends Omit<TableOptions<TData>, "getCoreRowModel"> {
  isLoading: boolean;
  noDataText?: React.ReactNode;
  subItem?: any;
  refetchData?: () => void;
  paginationConfig?: PaginationConfig;
}

export default function DataTable<TData>(props: DataTableProp<TData>) {
  const {
    isLoading,
    data,
    subItem,
    refetchData,
    paginationConfig,
    ...tableOptions
  } = props;
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    ...props,
  });
  const columnsCount = useMemo(() => table.getAllColumns().length, [table]);

  const memoizedData = useMemo(() => data, [data]);

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableBodySkeleton
          columnCount={
            // tableOptions.enableRowSelection ? columnsCount : columnsCount - 1
            table.getVisibleLeafColumns().length
          }
          rowCount={5}
        />
      );
    } else if (memoizedData?.length <= 0) {
      return table.getRowModel().rows.map((row, index) => (
        <TableRow key={row.id}>
          <TableCell>{index + 1}</TableCell>
          {row.getVisibleCells().map((cell, index) => {
            return (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}
        </TableRow>
      ));
    }
    if (memoizedData == null || memoizedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columnsCount} align="center">
            {props.noDataText || "No data available"}
          </TableCell>
        </TableRow>
      );
    }
    return table.getRowModel().rows.map((row, index) => (
      <TableRow key={row.id}>
        <TableCell>{index + 1}</TableCell>
        {row.getVisibleCells().map((cell) => {
          return (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  return (
    <>
      <TableContainer>
        <Box
          sx={{
            float: "right",
          }}
        >
          {refetchData && (
            <ReloadIconButton
              size="small"
              color="info"
              onClick={refetchData}
            ></ReloadIconButton>
          )}
        </Box>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={headerGroup.id}>
                <TableCell width={1}>S.N</TableCell>

                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      sx={{
                        width: header.getSize(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody sx={{
            minHeight: "50vh",
          }}>{renderTableBody()}</TableBody>
        </Table>
        {paginationConfig && (
          <TablePagination
            component="div"
            count={paginationConfig.totalCount}
            page={paginationConfig.page}
            onPageChange={paginationConfig.handlePageChange}
            rowsPerPage={paginationConfig.rowsPerPage}
            onRowsPerPageChange={paginationConfig.handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </TableContainer>
    </>
  );
}
