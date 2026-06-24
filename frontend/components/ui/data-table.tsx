"use client";

import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type Updater,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Inbox, SearchX, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchable?: boolean;
  paginated?: boolean;
  defaultPageSize?: number;
  manualSorting?: boolean;
  externalSorting?: SortingState;
  onExternalSortingChange?: (sorting: SortingState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchable = true,
  paginated = true,
  defaultPageSize = 25,
  manualSorting = false,
  externalSorting,
  onExternalSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = manualSorting ? (externalSorting ?? []) : internalSorting;
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const handleSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    if (manualSorting) onExternalSortingChange?.(next);
    else setInternalSorting(next);
  };

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const startRow = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalFiltered);
  const isFiltered = globalFilter.length > 0;
  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className="flex flex-col">
      {/* ── Search toolbar ── */}
      {searchable && (
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari data..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
      )}

      {/* ── Table + loading overlay ── */}
      <div className="relative min-h-[8rem]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Memuat data...
            </span>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b bg-muted/50 hover:bg-muted/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 select-none px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <span className="text-[10px] text-muted-foreground/40">
                          {header.column.getIsSorted() === "asc"
                            ? " ↑"
                            : header.column.getIsSorted() === "desc"
                              ? " ↓"
                              : " ↕"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoading && !hasRows ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-44 text-center">
                  {data.length > 0 && isFiltered ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                      <SearchX className="h-12 w-12 opacity-25" />
                      <p className="text-sm font-semibold text-foreground">
                        Data tidak ditemukan
                      </p>
                      <p className="text-xs">Coba ubah kata pencarian Anda</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                      <Inbox className="h-12 w-12 opacity-25" />
                      <p className="text-sm font-semibold text-foreground">
                        Belum ada data
                      </p>
                      <p className="text-xs">
                        Data akan muncul di sini setelah ditambahkan
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer: page size + info + pagination ── */}
      {paginated && !isLoading && data.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
          {/* Left: per-page selector + info */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                table.setPageSize(Number(v));
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[4.5rem] rounded-full text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)} className="text-xs">
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
              {totalFiltered === 0 ? (
                "Tidak ada data"
              ) : (
                <>
                  <strong className="text-primary">{startRow}–{endRow}</strong>
                  {" "}dari{" "}
                  <strong className="text-primary">{totalFiltered}</strong>
                  {" "}data
                  {isFiltered && (
                    <span> (filter dari <strong>{data.length}</strong>)</span>
                  )}
                </>
              )}
            </span>
          </div>

          {/* Right: pagination buttons */}
          {pageCount > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="mr-0.5 h-3 w-3" />Prev
              </Button>

              {buildPageList(pageIndex, pageCount).map((p, i) =>
                p === "..." ? (
                  <span
                    key={`el-${i}`}
                    className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pageIndex + 1 ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 rounded-full p-0 text-xs font-semibold ${
                      p === pageIndex + 1
                        ? "shadow-md"
                        : "hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => table.setPageIndex((p as number) - 1)}
                  >
                    {p}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next<ChevronRight className="ml-0.5 h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                Last
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildPageList(currentIndex: number, total: number): (number | "...")[] {
  const cur = currentIndex + 1;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (cur >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", cur - 1, cur, cur + 1, "...", total];
}
