"use client";

import { useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useReturnedToGA, useExportReturnedToGA } from "@/hooks/use-reports";
import { useDepartments } from "@/hooks/use-master";
import { useGlobalModal } from "@/lib/global-modal";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const PAGE_SIZE = 20;

type ReturnedRow = {
  id: string;
  assetCode: string | null;
  serialNumber: string;
  category: string | null;
  department: { name: string } | null;
  lastUser: string | null;
  returnedToGAAt: string | null;
  returnToGANote: string | null;
};

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function ReturnedToGAPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1);
  };
  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const modal = useGlobalModal();
  const exportMutation = useExportReturnedToGA();
  const { data: departments } = useDepartments();

  const resetPage = () => setPage(1);
  const isAnyFilter =
    search !== "" || departmentId !== "all" || dateFrom !== "" || dateTo !== "";

  const resetFilters = () => {
    setSearch("");
    setDepartmentId("all");
    setDateFrom("");
    setDateTo("");
    resetPage();
  };

  const { data, isLoading } = useReturnedToGA({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    departmentId: departmentId !== "all" ? departmentId : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? (sortOrder as "asc" | "desc") : undefined,
  });

  const rows: ReturnedRow[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleExport = () => {
    exportMutation.mutate(
      {
        departmentId: departmentId !== "all" ? departmentId : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      {
        onSuccess: () => modal.success({ title: "File Excel berhasil diunduh" }),
        onError: () => modal.error({ title: "Gagal export Excel" }),
      },
    );
  };

  const columns: ColumnDef<ReturnedRow>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {(page - 1) * PAGE_SIZE + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "assetCode",
      header: "Kode Aset",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.assetCode ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "serialNumber",
      header: "Serial Number",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.serialNumber}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => row.original.category ?? "-",
    },
    {
      id: "department",
      header: "Departemen",
      cell: ({ row }) => row.original.department?.name ?? "-",
    },
    {
      accessorKey: "lastUser",
      header: "User Terakhir",
      cell: ({ row }) => row.original.lastUser ?? "-",
    },
    {
      accessorKey: "returnedToGAAt",
      header: "Tgl. Dikembalikan",
      cell: ({ row }) =>
        row.original.returnedToGAAt
          ? format(new Date(row.original.returnedToGAAt), "dd MMM yyyy HH:mm", {
              locale: idLocale,
            })
          : "-",
    },
    {
      accessorKey: "returnToGANote",
      header: "Catatan",
      cell: ({ row }) => (
        <span className="block max-w-[180px] truncate text-xs text-muted-foreground">
          {row.original.returnToGANote ?? "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan Pengembalian ke GA
          </h1>
          <p className="text-muted-foreground">
            Daftar perangkat IT yang telah dikembalikan ke General Affairs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? "Exporting..." : "Export Excel"}
        </Button>
      </div>

      {/* Table card */}
      <Card>
        {/* Filter toolbar */}
        <div className="border-b bg-muted/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari serial number atau user..."
                className="h-9 pl-8 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* Date from */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Dari</span>
                <Input
                  type="date"
                  className="h-9 w-[140px] text-sm"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    resetPage();
                  }}
                />
              </div>
              {/* Date to */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">s/d</span>
                <Input
                  type="date"
                  className="h-9 w-[140px] text-sm"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    resetPage();
                  }}
                />
              </div>
              {/* Department */}
              <Select
                value={departmentId}
                onValueChange={(v) => {
                  setDepartmentId(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="h-9 w-[200px] text-sm">
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  {(departments ?? []).map(
                    (d: { id: string; name: string; code: string }) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.code} – {d.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {isAnyFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
          manualSorting
          externalSorting={sorting}
          onExternalSortingChange={handleSortingChange}
        />

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              <strong className="text-primary">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </strong>{" "}
              dari <strong className="text-primary">{total}</strong> data
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-0.5 h-3 w-3" />
                  Prev
                </Button>
                {buildPages(page, totalPages).map((p, i) =>
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
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 rounded-full p-0 text-xs font-semibold ${p === page ? "shadow-md" : "hover:border-primary hover:text-primary"}`}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-0.5 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
