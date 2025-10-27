import {
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ColumnResizeDirection,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowData,
  SortingState,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import TableBodySkeleton from "./molecules/TableBodySkeleton";

interface DataTableProp<TData extends RowData>
  extends Omit<TableOptions<TData>, "getCoreRowModel"> {
  isLoading: boolean;
  noDataText?: React.ReactNode;
  enablePagination?: boolean;
  subItem?: any;
}

export default function DataTable<TData>(props: DataTableProp<TData>) {
  const { isLoading, data, subItem, ...tableOptions } = props;
  const table = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    ...props,
  });
  const columnsCount = useMemo(
    () => table.getVisibleFlatColumns().length,
    [table]
  );

  const memoizedData = useMemo(() => data, [data]);

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <TableBodySkeleton
          columnCount={
            // tableOptions.enableRowSelection ? columnsCount : columnsCount - 1
            columnsCount
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
        {row.getVisibleCells().map((cell, index) => {
          return (
            <TableCell
              key={cell.id}
              style={{
                width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
              }}
            >
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
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={headerGroup.id}>
                <TableCell>S.N</TableCell>

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
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
