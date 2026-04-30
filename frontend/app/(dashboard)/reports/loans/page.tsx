"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Download,
  Search,
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLoanReport, useExportLoanReport } from "@/hooks/use-reports";
import { useGlobalModal } from "@/lib/global-modal";
import { format, differenceInDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const PAGE_SIZE = 20;
const FILE_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

type LoanRow = {
  id: string;
  borrowerName: string;
  borrowedAt: string;
  returnedAt: string | null;
  returnPhotoPath: string | null;
  note: string | null;
  status: "BORROWED" | "RETURNED";
  device: {
    serialNumber: string;
    unitType: { name: string; code: string } | null;
    department: { name: string; code: string } | null;
  } | null;
};

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function LoanReportPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const modal = useGlobalModal();
  const exportMutation = useExportLoanReport();

  const resetPage = () => setPage(1);
  const isAnyFilter =
    search !== "" || status !== "all" || dateFrom !== "" || dateTo !== "";

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    resetPage();
  };

  const { data, isLoading } = useLoanReport({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status !== "all" ? (status as "BORROWED" | "RETURNED") : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const loans = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalBorrowed = data?.totalBorrowed ?? 0;
  const totalReturned = data?.totalReturned ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleExport = () => {
    exportMutation.mutate(
      {
        status: status !== "all" ? status : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
      {
        onSuccess: () => modal.success({ title: "File Excel berhasil diunduh" }),
        onError: () => modal.error({ title: "Gagal export Excel" }),
      },
    );
  };

  const columns: ColumnDef<LoanRow>[] = [
    {
      accessorKey: "device.serialNumber",
      header: "Serial Number",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.device?.serialNumber ?? "-"}
        </span>
      ),
    },
    {
      id: "unitType",
      header: "Jenis",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.device?.unitType?.code ?? "-"}
        </Badge>
      ),
    },
    {
      id: "department",
      header: "Departemen",
      cell: ({ row }) =>
        row.original.device?.department?.name ?? "-",
    },
    {
      accessorKey: "borrowerName",
      header: "Peminjam",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.borrowerName}</span>
      ),
    },
    {
      accessorKey: "borrowedAt",
      header: "Tgl. Pinjam",
      cell: ({ row }) =>
        format(new Date(row.original.borrowedAt), "dd MMM yyyy HH:mm", {
          locale: idLocale,
        }),
    },
    {
      accessorKey: "returnedAt",
      header: "Tgl. Kembali",
      cell: ({ row }) =>
        row.original.returnedAt
          ? format(new Date(row.original.returnedAt), "dd MMM yyyy HH:mm", {
              locale: idLocale,
            })
          : "-",
    },
    {
      id: "duration",
      header: "Durasi",
      cell: ({ row }) => {
        if (!row.original.returnedAt) {
          const days = differenceInDays(
            new Date(),
            new Date(row.original.borrowedAt),
          );
          return (
            <span className="text-xs text-amber-600">{days} hari (aktif)</span>
          );
        }
        const days = differenceInDays(
          new Date(row.original.returnedAt),
          new Date(row.original.borrowedAt),
        );
        return <span className="text-xs">{days} hari</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "BORROWED" ? "destructive" : "outline"}
          className={
            row.original.status === "RETURNED"
              ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
              : ""
          }
        >
          {row.original.status === "BORROWED" ? "Dipinjam" : "Dikembalikan"}
        </Badge>
      ),
    },
    {
      accessorKey: "note",
      header: "Catatan",
      cell: ({ row }) => (
        <span className="block max-w-[140px] truncate text-xs text-muted-foreground">
          {row.original.note ?? "-"}
        </span>
      ),
    },
    {
      id: "photo",
      header: "",
      cell: ({ row }) =>
        row.original.returnPhotoPath ? (
          <Button
            variant="ghost"
            size="icon"
            title="Lihat foto bukti"
            onClick={() => setPreviewPhoto(row.original.returnPhotoPath!)}
          >
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan Peminjaman
          </h1>
          <p className="text-muted-foreground">
            Riwayat dan statistik peminjaman perangkat IT
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

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Peminjaman</p>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">sesuai filter aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Sedang Dipinjam</p>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{totalBorrowed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? ((totalBorrowed / total) * 100).toFixed(1) : 0}% dari total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Sudah Dikembalikan</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">{totalReturned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? ((totalReturned / total) * 100).toFixed(1) : 0}% dari total
            </p>
          </CardContent>
        </Card>
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
                placeholder="Cari peminjam atau serial number..."
                className="h-9 pl-8 text-sm"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
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
                  onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
                />
              </div>
              {/* Date to */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">s/d</span>
                <Input
                  type="date"
                  className="h-9 w-[140px] text-sm"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
                />
              </div>
              {/* Status */}
              <Select value={status} onValueChange={(v) => { setStatus(v); resetPage(); }}>
                <SelectTrigger className="h-9 w-[180px] text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="BORROWED">Sedang Dipinjam</SelectItem>
                  <SelectItem value="RETURNED">Sudah Dikembalikan</SelectItem>
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
          data={loans as LoanRow[]}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
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
                  <ChevronLeft className="mr-0.5 h-3 w-3" />Prev
                </Button>
                {buildPages(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`el-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
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
                  Next<ChevronRight className="ml-0.5 h-3 w-3" />
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

      {/* Foto bukti dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={(o) => !o && setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pengembalian</DialogTitle>
            <DialogDescription>Foto kondisi perangkat saat dikembalikan</DialogDescription>
          </DialogHeader>
          {previewPhoto && (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-md border">
                <img
                  src={`${FILE_BASE_URL}${previewPhoto}`}
                  alt="Bukti pengembalian"
                  className="max-h-[60vh] w-full object-contain"
                />
              </div>
              <a
                href={`${FILE_BASE_URL}${previewPhoto}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline underline-offset-2"
              >
                Buka di tab baru
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
